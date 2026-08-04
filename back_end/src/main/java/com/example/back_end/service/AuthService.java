package com.example.back_end.service;

import com.example.back_end.constant.PredefinedRole;
import com.example.back_end.dto.UserDto;
import com.example.back_end.dto.request.IntrospectRequest;
import com.example.back_end.dto.request.LoginRequest;
import com.example.back_end.dto.request.UserCreationRequest;
import com.example.back_end.dto.response.AuthenticationResponse;
import com.example.back_end.dto.response.IntrospectResponse;
import com.example.back_end.entity.InvalidatedToken;
import com.example.back_end.entity.Role;
import com.example.back_end.entity.User;
import com.example.back_end.exception.AppException;
import com.example.back_end.exception.ErrorCode;
import com.example.back_end.mapper.UserMapper;
import com.example.back_end.repositories.InvalidatedTokenRepository;
import com.example.back_end.repositories.RoleRepository;
import com.example.back_end.repositories.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    InvalidatedTokenRepository invalidatedTokenRepository;
    @Autowired
    private RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
    private final ModelMapper modelMapper;
    @Autowired
    private UserMapper userMapper;
    @NonFinal
    @Value("${jwt.signer-key}")
    protected String SIGNER_KEY;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValue = true;
        String email="";
        try {
            verifyToken(token);
            email = verifyToken(token).getJWTClaimsSet().getSubject();
        } catch (AppException e){
            isValue = false;
        }
        return IntrospectResponse.builder().valid(isValue).email(email).build();
    }

    public AuthenticationResponse login(LoginRequest request){
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        UserDto userDto = modelMapper.map(user, UserDto.class);

        if(!user.getActive()){
            throw new AppException(ErrorCode.INACTIVE_ACC);
        }

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if(!authenticated){
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        var token = generateToken(user);

        // Get user role
        String userRole = user.getRoles().isEmpty() ? "USER" :
                user.getRoles().iterator().next().getName();

        return AuthenticationResponse.builder()
                .token(token)
                .currentUser(userDto)
                .authenticated(true)
                .role(userRole)
                .build();
    }

    public void logout(IntrospectRequest request) throws ParseException, JOSEException {
        var signToken = verifyToken(request.getToken());
        String jit = signToken.getJWTClaimsSet().getJWTID();
        Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();
        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build();
        invalidatedTokenRepository.save(invalidatedToken);
    }

    public SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);
        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        var verified = signedJWT.verify(verifier);

        if(!(verified && expiryTime.after(new Date()))){
            log.info("Het han");
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        
        String jwtId = signedJWT.getJWTClaimsSet().getJWTID();
        boolean isInvalidated = invalidatedTokenRepository.existsById(jwtId);
        
        if(isInvalidated){
            log.info("da dang xuat");
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        
        return signedJWT;
    }

    public String generateToken(User user){
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("CDWED.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope",buildScope(user))
                .build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header,payload);
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            System.out.println("Can't get toten"+e);
            throw new RuntimeException(e);
        }
    }

    public String createVerifyToken(String email) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(email)
                .issuer("CDWED.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("custorClaim","Custom")
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header,payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot get token",e);
            throw new RuntimeException(e);
        }

    }

    /** JWT for forgot-password flow; {@code verifyAccount} redirects to reset page when claim is present. */
    public String createPasswordResetToken(String email) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(email)
                .issuer("CDWED.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("tokenUse", "PASSWORD_RESET")
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create password reset token", e);
            throw new RuntimeException(e);
        }
    }

    public String getTokenUse(String token) throws ParseException {
        return (String) SignedJWT.parse(token).getJWTClaimsSet().getClaim("tokenUse");
    }

    public void resetPasswordWithToken(String token, String newPassword) throws ParseException, JOSEException {
        SignedJWT sj = verifyToken(token);
        String tokenUse = (String) sj.getJWTClaimsSet().getClaim("tokenUse");
        if (!"PASSWORD_RESET".equals(tokenUse)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String jit = sj.getJWTClaimsSet().getJWTID();
        String email = sj.getJWTClaimsSet().getSubject();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        Date expiryTime = sj.getJWTClaimsSet().getExpirationTime();
        invalidatedTokenRepository.save(InvalidatedToken.builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build());
    }

    private String buildScope(User user){
        StringJoiner stringJoiner = new StringJoiner(" "); // dùng khoảng trắng ngăn cách scope
        if(!CollectionUtils.isEmpty(user.getRoles())) {
            user.getRoles().forEach(role -> stringJoiner.add(role.getName())); // Lấy tên role
        }
        return stringJoiner.toString();
    }
}
