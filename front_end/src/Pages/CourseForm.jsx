import React, { useCallback, useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SellerService from '../API/SellerService';
import { ProductContext } from '../context/ProductContext';
import {
  createEmptyLesson,
  createEmptyResource,
  normalizeResources,
  toResourceDrafts,
} from '../features/courses/courseFormView';
import CourseBasicFields from '../features/courses/CourseBasicFields';
import CourseCoverImageField from '../features/courses/CourseCoverImageField';
import CourseFormActions from '../features/courses/CourseFormActions';
import CourseFormHeader from '../features/courses/CourseFormHeader';
import { loadSwal } from '../shared/utils/alerts';

const CourseLessonsEditor = React.lazy(() => import('../features/courses/CourseLessonsEditor'));

const LessonsEditorFallback = () => (
  <section className="border-t border-slate-200 pt-6">
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
      Đang tải trình quản lý bài giảng...
    </div>
  </section>
);

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useContext(ProductContext);
  const [loading, setLoading] = useState(false);
  const [lessonUploading, setLessonUploading] = useState(false);
  const [lessonUploadProgress, setLessonUploadProgress] = useState(0);
  const [lesson, setLesson] = useState(() => createEmptyLesson());
  const [coverImageFile, setCoverImageFile] = useState(null);
  const lessonFileInputRef = useRef(null);
  const [uploadedLessons, setUploadedLessons] = useState([]);
  const [lessonResourceDrafts, setLessonResourceDrafts] = useState({});
  const [resourceSavingLessonId, setResourceSavingLessonId] = useState(null);
  const [uploadingResourceKey, setUploadingResourceKey] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '',
    totalHour: '',
    lessons: '',
    age: '',
    level: 'Intermediate'
  });

  const sellerId = location.state?.sellerId || session?.currentUser?.id;
  const isEditMode = !!id;
  const computedTotalMinutes = uploadedLessons.reduce((sum, item) => sum + Number(item.duration || 0), 0);
  const computedTotalHours = Math.ceil(computedTotalMinutes / 60);
  const computedLessonCount = uploadedLessons.length;
  const goToSellerDashboard = useCallback(() => navigate('/seller/dashboard'), [navigate]);
  const clearCoverImage = useCallback(() => {
    setCoverImageFile(null);
    setFormData((prev) => ({ ...prev, image: '' }));
  }, []);

  useEffect(() => {
    if (isEditMode && location.state?.course) {
      const course = location.state.course;
      setFormData({
        name: course.name || '',
        description: course.description || '',
        price: course.price || '',
        categoryId: course.categoryId || '',
        image: course.image || '',
        totalHour: course.totalHour || '',
        lessons: course.lessons || '',
        age: course.age || '18+ year old',
        level: course.level || 'Intermediate'
      });
    }
  }, [isEditMode, location.state]);

  const loadLessons = useCallback(async () => {
    if (!isEditMode || !sellerId) return;
    try {
      const response = await SellerService.getLessons(sellerId, Number(id));
      if (response.code === 200) {
        const lessons = response.result || [];
        setUploadedLessons(lessons);
        setLessonResourceDrafts(Object.fromEntries(lessons.map((item) => [item.id, toResourceDrafts(item.resources)])));
      }
    } catch {
      setUploadedLessons([]);
      setLessonResourceDrafts({});
    }
  }, [id, isEditMode, sellerId]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLessonChange = (field, value) => {
    setLesson((prev) => ({ ...prev, [field]: value }));
  };

  const handleLessonFileChange = (file) => {
    setLesson((prev) => ({ ...prev, file }));
  };

  const handleNewLessonResourceChange = (index, field, value) => {
    setLesson((prev) => {
      const resources = prev.resources?.length ? [...prev.resources] : [createEmptyResource()];
      resources[index] = { ...(resources[index] || createEmptyResource()), [field]: value };
      return { ...prev, resources };
    });
  };

  const handleAddNewLessonResource = () => {
    setLesson((prev) => ({ ...prev, resources: [...(prev.resources || []), createEmptyResource()] }));
  };

  const handleRemoveNewLessonResource = (index) => {
    setLesson((prev) => {
      const resources = (prev.resources || []).filter((_, itemIndex) => itemIndex !== index);
      return { ...prev, resources: resources.length ? resources : [createEmptyResource()] };
    });
  };

  const handleLessonResourceDraftChange = (lessonId, index, field, value) => {
    setLessonResourceDrafts((current) => {
      const resources = current[lessonId]?.length ? [...current[lessonId]] : [createEmptyResource()];
      resources[index] = { ...(resources[index] || createEmptyResource()), [field]: value };
      return { ...current, [lessonId]: resources };
    });
  };

  const handleAddLessonResource = (lessonId) => {
    setLessonResourceDrafts((current) => ({
      ...current,
      [lessonId]: [...(current[lessonId] || []), createEmptyResource()],
    }));
  };

  const handleRemoveLessonResource = (lessonId, index) => {
    setLessonResourceDrafts((current) => {
      const resources = (current[lessonId] || []).filter((_, itemIndex) => itemIndex !== index);
      return { ...current, [lessonId]: resources.length ? resources : [createEmptyResource()] };
    });
  };

  const uploadResourceFile = async (uploadKey, file, onUploaded) => {
    const Swal = await loadSwal();
    if (!sellerId || !id) {
      await Swal.fire({
        title: "Chưa thể upload tài liệu",
        text: "Hãy lưu khóa học trước khi đính kèm file tài liệu.",
        icon: "warning",
      });
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      await Swal.fire({
        title: "File quá lớn",
        text: "Tài liệu bài học tối đa 25MB.",
        icon: "warning",
      });
      return;
    }

    try {
      setUploadingResourceKey(uploadKey);
      const signatureResponse = await SellerService.getLessonResourceUploadSignature(sellerId, Number(id));
      if (signatureResponse.code !== 200 || !signatureResponse.result) {
        throw new Error(signatureResponse.message || "Không thể tạo chữ ký upload tài liệu");
      }
      const uploaded = await SellerService.uploadRawFileDirect(signatureResponse.result, file);
      onUploaded(uploaded);
    } catch (error) {
      await Swal.fire({
        title: "Không thể upload tài liệu",
        text: error?.response?.data?.message || error.message || "Vui lòng thử lại.",
        icon: "error",
      });
    } finally {
      setUploadingResourceKey("");
    }
  };

  const handleNewLessonResourceFileUpload = (index, file) => {
    void uploadResourceFile(`new-resource-${index}`, file, (uploaded) => {
      setLesson((prev) => {
        const resources = prev.resources?.length ? [...prev.resources] : [createEmptyResource()];
        const current = resources[index] || createEmptyResource();
        resources[index] = {
          ...current,
          fileName: uploaded.fileName,
          fileSize: uploaded.fileSize,
          mimeType: uploaded.mimeType,
          title: current.title || uploaded.fileName,
          type: "FILE",
          url: uploaded.secureUrl,
        };
        return { ...prev, resources };
      });
    });
  };

  const handleLessonResourceFileUpload = (lessonId, index, file) => {
    void uploadResourceFile(`lesson-${lessonId}-resource-${index}`, file, (uploaded) => {
      setLessonResourceDrafts((current) => {
        const resources = current[lessonId]?.length ? [...current[lessonId]] : [createEmptyResource()];
        const currentResource = resources[index] || createEmptyResource();
        resources[index] = {
          ...currentResource,
          fileName: uploaded.fileName,
          fileSize: uploaded.fileSize,
          mimeType: uploaded.mimeType,
          title: currentResource.title || uploaded.fileName,
          type: "FILE",
          url: uploaded.secureUrl,
        };
        return { ...current, [lessonId]: resources };
      });
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLessonUpload = async () => {
    const Swal = await loadSwal();
    if (!sellerId || !lesson.file || !lesson.episodeNumber) {
      await Swal.fire({ title: 'Chưa đủ thông tin bài giảng', text: 'Hãy chọn video và nhập số thứ tự bài trước khi upload.', icon: 'warning' });
      return;
    }
    if (uploadedLessons.some((item) => Number(item.episodeNumber) === Number(lesson.episodeNumber))) {
      await Swal.fire({
        title: 'Số thứ tự bài đã tồn tại',
        text: 'Hãy chọn số thứ tự khác để tránh bị trùng bài giảng.',
        icon: 'warning'
      });
      return;
    }
    setLessonUploading(true);
    try {
      const signatureResponse = await SellerService.getLessonUploadSignature(sellerId, Number(id));
      if (signatureResponse.code !== 200 || !signatureResponse.result) throw new Error(signatureResponse.message || 'Không thể tạo chữ ký upload');
      const uploadedVideo = await SellerService.uploadVideoDirect(signatureResponse.result, lesson.file, setLessonUploadProgress);
      const response = await SellerService.saveLesson(sellerId, Number(id), {
        title: lesson.title,
        episodeNumber: Number(lesson.episodeNumber),
        isPreview: lesson.isPreview,
        resources: normalizeResources(lesson.resources),
        ...uploadedVideo,
      });
      if (response.code === 200) {
        await Swal.fire({ title: 'Đã thêm bài giảng', text: 'Video đã sẵn sàng trong khóa học của bạn.', icon: 'success' });
        setLesson(createEmptyLesson(false));
        await loadLessons();
      } else {
        throw new Error(response.message || 'Không thể upload video');
      }
    } catch (error) {
      await Swal.fire({ title: 'Upload thất bại', text: error?.response?.data?.message || error.message || 'Vui lòng thử lại.', icon: 'error' });
    } finally {
      setLessonUploading(false);
      setLessonUploadProgress(0);
    }
  };

  const handleSaveLessonResources = async (lessonId) => {
    if (!sellerId || !id) return;
    const Swal = await loadSwal();
    setResourceSavingLessonId(lessonId);
    try {
      const resources = normalizeResources(lessonResourceDrafts[lessonId] || []);
      const response = await SellerService.updateLessonResources(sellerId, Number(id), lessonId, resources);
      if (response.code !== 200) throw new Error(response.message || 'Không thể cập nhật tài liệu');
      const updatedResources = response.result || [];
      setUploadedLessons((current) => current.map((item) => (
        Number(item.id) === Number(lessonId) ? { ...item, resources: updatedResources } : item
      )));
      setLessonResourceDrafts((current) => ({ ...current, [lessonId]: toResourceDrafts(updatedResources) }));
      await Swal.fire({ title: 'Đã lưu tài liệu', text: 'Tài liệu của bài học đã được cập nhật.', icon: 'success' });
    } catch (error) {
      await Swal.fire({ title: 'Không thể lưu tài liệu', text: error?.response?.data?.message || error.message || 'Vui lòng thử lại.', icon: 'error' });
    } finally {
      setResourceSavingLessonId(null);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    const Swal = await loadSwal();
    const confirmation = await Swal.fire({ title: 'Xóa bài giảng?', text: 'Video này sẽ không còn xuất hiện trong khóa học.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Xóa', cancelButtonText: 'Hủy' });
    if (!confirmation.isConfirmed) return;
    try {
      const response = await SellerService.deleteLesson(sellerId, Number(id), lessonId);
      if (response.code !== 200) throw new Error(response.message);
      await loadLessons();
    } catch (error) {
      await Swal.fire({ title: 'Không thể xóa bài giảng', text: error?.response?.data?.message || 'Vui lòng thử lại.', icon: 'error' });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const Swal = await loadSwal();
    setLoading(true);
    
    try {
      const courseData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId),
        level: formData.level,
        image: formData.image,
        totalHour: computedTotalHours,
        lessons: computedLessonCount,
        age: formData.age
      };

      if (coverImageFile) {
        const signatureResponse = await SellerService.getCourseImageUploadSignature(sellerId);
        if (signatureResponse.code !== 200 || !signatureResponse.result) throw new Error(signatureResponse.message || 'Không thể tạo chữ ký upload ảnh');
        courseData.image = await SellerService.uploadCourseImage(signatureResponse.result, coverImageFile);
      }

      let response;
      if (isEditMode) {
        response = await SellerService.updateCourse(sellerId, id, courseData);
      } else {
        response = await SellerService.createCourse(sellerId, courseData);
      }

      if (response.code === 200) {
        await Swal.fire({
          title: 'Thành công!',
          text: isEditMode
            ? 'Đã lưu thay đổi. Kiểm tra lại nội dung và gửi xét duyệt trước khi khóa học được công khai.'
            : 'Khóa học đã được tạo ở trạng thái bản nháp.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        goToSellerDashboard();
      }
    } catch (error) {
      console.error('Error saving course:', error);
      await Swal.fire({
        title: 'Lỗi!',
        text: `Có lỗi xảy ra khi ${isEditMode ? 'cập nhật' : 'tạo'} khóa học.`,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <CourseFormHeader isEditMode={isEditMode} onBack={goToSellerDashboard} />

          <motion.form 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit} 
            className="bg-white rounded-xl shadow-lg p-8 space-y-6"
          >
            <CourseCoverImageField
              image={formData.image}
              onImageChange={handleImageChange}
              onClearImage={clearCoverImage}
            />

            <CourseBasicFields formData={formData} onChange={handleChange} />

            {isEditMode && (
              <React.Suspense fallback={<LessonsEditorFallback />}>
                <CourseLessonsEditor
                  lesson={lesson}
                  lessonFileInputRef={lessonFileInputRef}
                  lessonUploading={lessonUploading}
                  lessonUploadProgress={lessonUploadProgress}
                  uploadedLessons={uploadedLessons}
                  lessonResourceDrafts={lessonResourceDrafts}
                  resourceSavingLessonId={resourceSavingLessonId}
                  onLessonChange={handleLessonChange}
                  onLessonFileChange={handleLessonFileChange}
                  onLessonUpload={handleLessonUpload}
                  onNewLessonResourceChange={handleNewLessonResourceChange}
                  onNewLessonResourceFileUpload={handleNewLessonResourceFileUpload}
                  onAddNewLessonResource={handleAddNewLessonResource}
                  onRemoveNewLessonResource={handleRemoveNewLessonResource}
                  onDeleteLesson={handleDeleteLesson}
                  onAddLessonResource={handleAddLessonResource}
                  onLessonResourceDraftChange={handleLessonResourceDraftChange}
                  onLessonResourceFileUpload={handleLessonResourceFileUpload}
                  onRemoveLessonResource={handleRemoveLessonResource}
                  onSaveLessonResources={handleSaveLessonResources}
                  uploadingResourceKey={uploadingResourceKey}
                />
              </React.Suspense>
            )}
            <CourseFormActions
              isEditMode={isEditMode}
              loading={loading}
              onCancel={goToSellerDashboard}
            />
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseForm; 
