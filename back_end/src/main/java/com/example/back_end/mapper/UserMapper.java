package com.example.back_end.mapper;

import com.example.back_end.dto.request.UserCreationRequest;
import com.example.back_end.dto.response.UserResponse;
import com.example.back_end.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.stream.Collectors;

@Mapper(componentModel = "spring", imports = Collectors.class)
public interface UserMapper {
//    @Mapping(source = "email", target = "email")
    User toUser(UserCreationRequest request);
    UserResponse toResponse(User user);
}
