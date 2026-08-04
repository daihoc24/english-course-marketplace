import axiosClient from './axiosClient';

const CourseService = {
  // Lấy tất cả khóa học
  getAllCourses: async () => {
    try {
      const response = await axiosClient.get('/courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching all courses:', error);
      throw error;
    }
  },

  // Lấy khóa học theo ID
  getCourseById: async (id) => {
    try {
      const response = await axiosClient.get(`/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course by ID:', error);
      throw error;
    }
  },

  // Tìm kiếm khóa học theo từ khóa
  searchCourses: async (keyword) => {
    try {
      const response = await axiosClient.get('/courses/search', {
        params: { keyword }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  },

  // Tìm kiếm khóa học theo category
  searchCoursesByCategory: async (categoryId) => {
    try {
      const response = await axiosClient.get(`/courses/search/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error searching courses by category:', error);
      throw error;
    }
  },

  // Tìm kiếm khóa học theo khoảng giá
  searchCoursesByPriceRange: async (minPrice, maxPrice) => {
    try {
      const response = await axiosClient.get('/courses/search/price', {
        params: { minPrice, maxPrice }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching courses by price range:', error);
      throw error;
    }
  },



  // Tìm kiếm nâng cao với nhiều tiêu chí
  searchCoursesAdvanced: async (searchParams) => {
    try {
      const response = await axiosClient.get('/courses/search/advanced', {
        params: searchParams
      });
      return response.data;
    } catch (error) {
      console.error('Error in advanced search:', error);
      throw error;
    }
  },

  // Lấy chi tiết khóa học
  getCourseDetails: async (courseId) => {
    try {
      const response = await axiosClient.get(`/courses/details/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course details:', error);
      throw error;
    }
  },

  // Đánh giá khóa học
  rateCourse: async (courseId, userId, rating) => {
    try {
      const response = await axiosClient.post(`/courses/${courseId}/rate`, {
        userId,
        rating
      });
      return response.data;
    } catch (error) {
      console.error('Error rating course:', error);
      throw error;
    }
  },

  // Lấy đánh giá của user cho khóa học
  getUserRating: async (courseId, userId) => {
    try {
      const response = await axiosClient.get(`/courses/${courseId}/user-rating/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user rating:', error);
      throw error;
    }
  }
};

export default CourseService;