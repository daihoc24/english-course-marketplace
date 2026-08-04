package com.example.back_end.repositories;

import com.example.back_end.entity.LessonQuestionReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonQuestionReplyRepository extends JpaRepository<LessonQuestionReply, Long> {
    List<LessonQuestionReply> findByQuestion_IdOrderByCreatedAtAscIdAsc(Long questionId);

    Integer countByQuestion_Id(Long questionId);
}
