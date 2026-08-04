package com.example.back_end.mapper;

import com.example.back_end.dto.response.OrderResponse;
import com.example.back_end.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mappings({
            @Mapping(source = "idUser.id", target = "idUser"),
            @Mapping(source = "idUser.fullname", target = "userName"),
            @Mapping(source = "idUser.email", target = "userEmail"),
            @Mapping(source = "idCourse", target = "idCourse"),
            @Mapping(source = "idCourse.id", target = "courseId"),
            @Mapping(source = "idCourse.name", target = "courseName"),
            @Mapping(source = "idCourse.image", target = "courseImage")
    })
    OrderResponse toResponse(Order order);
}
