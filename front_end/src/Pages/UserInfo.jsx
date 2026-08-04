import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { getUserById } from '../API/AuthService';
import { getLearnerWallet } from '../API/RefundService';
import {
  certificateInputRows,
  parseCertificates,
  serializeCertificates,
} from '../utils/certificates';
import { readStoredSession } from '../utils/session';

const LearnerProfileAside = lazy(() => import('../features/users/LearnerProfileAside'));
const LearnerProfileForm = lazy(() => import('../features/users/LearnerProfileForm'));
const LearnerProfileHeader = lazy(() => import('../features/users/LearnerProfileHeader'));

const ProfileFormFallback = () => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
    Đang tải biểu mẫu hồ sơ...
  </div>
)

const emptyProfile = {
  fullname: '',
  username: '',
  email: '',
  phone: '',
  gender: '',
  introduce: '',
  certificate: '',
  avatar: '',
  imageUrl: '',
};

const normalizeProfile = (data = {}) => ({
  ...emptyProfile,
  ...data,
  fullname: data.fullname || data.fullName || "",
  username: data.username || "",
  email: data.email || "",
  phone: data.phone || "",
  gender: data.gender || "",
  introduce: data.introduce || data.introduce || "",
  certificate: data.certificate || "",
  avatar: data.avatar || data.imageUrl || '',
  imageUrl: data.imageUrl || data.avatar || '',
});

const UserInformation = () => {
  const session = readStoredSession();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState(emptyProfile);
  const [formData, setFormData] = useState(emptyProfile);
  const [certificateItems, setCertificateItems] = useState(() => certificateInputRows(""));
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [uploadingCertificateIndex, setUploadingCertificateIndex] = useState(null);
  const [learnerCreditBalance, setLearnerCreditBalance] = useState(0);

  const displayAvatar = previewUrl || userInfo.avatar || userInfo.imageUrl;
  const displayName = userInfo.fullname || userInfo.fullName || userInfo.username || userInfo.email || "U";
  const initials = useMemo(() => {
    const name = displayName;
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }, [displayName]);
  const displayedCertificateItems = useMemo(
    () => (isEditing ? certificateItems : parseCertificates(userInfo.certificate)),
    [certificateItems, isEditing, userInfo.certificate]
  );

  const fetchUser = useCallback(async () => {
    if (!session?.currentUser?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getUserById(session.currentUser.id);
      const profile = normalizeProfile(response.data?.result);
      setUserInfo(profile);
      setFormData(profile);
      setCertificateItems(certificateInputRows(profile.certificate));
      if (session?.token) {
        try {
          const walletResponse = await getLearnerWallet(session.token);
          setLearnerCreditBalance(Number(walletResponse.data?.result?.balanceVnd || 0));
        } catch {
          setLearnerCreditBalance(0);
        }
      }
    } catch (_error) {
      toast.error('Không thể tải hồ sơ người dùng.');
      setUserInfo(emptyProfile);
      setFormData(emptyProfile);
    } finally {
      setLoading(false);
    }
  }, [session?.currentUser?.id, session?.token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setFormData(userInfo);
    setCertificateItems(certificateInputRows(userInfo.certificate));
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setCertificateItems(certificateInputRows(userInfo.certificate));
    setIsEditing(true);
  };

  const handleCertificateChange = (index, field, value) => {
    setCertificateItems((current) => {
      const next = current.length ? [...current] : [{ title: "", link: "" }];
      next[index] = { ...(next[index] || { title: "", link: "" }), [field]: value };
      return next;
    });
  };

  const handleAddCertificate = () => {
    setCertificateItems((current) => [...current, { title: "", link: "", fileName: "", mimeType: "", fileSize: 0, type: "" }]);
  };

  const handleRemoveCertificate = (index) => {
    setCertificateItems((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [{ title: "", link: "", fileName: "", mimeType: "", fileSize: 0, type: "" }];
    });
  };

  const handleCertificateFileUpload = async (index, file) => {
    if (file.size > 25 * 1024 * 1024) {
      toast.error("File chứng chỉ tối đa 25MB.");
      return;
    }

    try {
      setUploadingCertificateIndex(index);
      const { default: UserService } = await import('../API/UserService');
      const signatureResponse = await UserService.getCertificateUploadSignature();
      if (signatureResponse.code !== 200 || !signatureResponse.result) {
        throw new Error(signatureResponse.message || "Không thể tạo chữ ký upload chứng chỉ");
      }
      const uploaded = await UserService.uploadRawFileDirect(signatureResponse.result, file);
      setCertificateItems((current) => {
        const next = current.length ? [...current] : [{ title: "", link: "" }];
        const item = next[index] || { title: "", link: "" };
        next[index] = {
          ...item,
          fileName: uploaded.fileName,
          fileSize: uploaded.fileSize,
          link: uploaded.secureUrl,
          mimeType: uploaded.mimeType,
          title: item.title || uploaded.fileName,
          type: "FILE",
        };
        return next;
      });
      toast.success("Đã tải file chứng chỉ lên.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Không thể upload file chứng chỉ.");
    } finally {
      setUploadingCertificateIndex(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const certificate = serializeCertificates(certificateItems);
      if (certificate.length > 10000) {
        toast.error('Danh sách chứng chỉ quá dài.');
        return;
      }
      const nextFormData = {
        ...formData,
        certificate,
      };
      const { default: UserService } = await import('../API/UserService');
      const response = await UserService.updateUserProfile({
        fullname: nextFormData.fullname,
        username: nextFormData.username,
        phone: nextFormData.phone,
        gender: nextFormData.gender,
        introduce: nextFormData.introduce,
        certificate: nextFormData.certificate,
      });
      const updated = normalizeProfile({
        ...userInfo,
        ...nextFormData,
        ...response.data?.result,
      });
      setUserInfo(updated);
      setFormData(updated);
      setCertificateItems(certificateInputRows(updated.certificate));
      setIsEditing(false);
      toast.success('Đã cập nhật hồ sơ.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh đại diện tối đa 5MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAvatarUpdate = async () => {
    if (!selectedFile) return;

    try {
      setAvatarLoading(true);
      const { default: UserService } = await import('../API/UserService');
      const response = await UserService.updateAvatar(selectedFile);
      const updated = normalizeProfile({
        ...userInfo,
        ...response.data?.result,
      });
      setUserInfo(updated);
      setFormData((current) => ({ ...current, ...updated }));
      setSelectedFile(null);
      setPreviewUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchUser();
      toast.success('Đã cập nhật ảnh đại diện.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật ảnh đại diện.');
    } finally {
      setAvatarLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-slate-600">Đang tải hồ sơ...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <Suspense fallback={<div className="min-h-56 bg-slate-900" />}>
            <LearnerProfileHeader
              avatarLoading={avatarLoading}
              displayAvatar={displayAvatar}
              displayName={displayName}
              fileInputRef={fileInputRef}
              initials={initials}
              isEditing={isEditing}
              onAvatarUpdate={handleAvatarUpdate}
              onCancel={handleCancel}
              onFileChange={handleFileChange}
              onSave={handleSave}
              onStartEdit={handleStartEdit}
              saving={saving}
              selectedFile={selectedFile}
              userInfo={userInfo}
            />
          </Suspense>

          <div className="px-6 pb-10 sm:px-10">
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <Suspense fallback={<ProfileFormFallback />}>
                <LearnerProfileForm
                  certificateItems={certificateItems}
                  displayedCertificateItems={displayedCertificateItems}
                  formData={formData}
                  isEditing={isEditing}
                  onCertificateAdd={handleAddCertificate}
                  onCertificateChange={handleCertificateChange}
                  onCertificateFileUpload={handleCertificateFileUpload}
                  onCertificateRemove={handleRemoveCertificate}
                  onInputChange={handleInputChange}
                  uploadingCertificateIndex={uploadingCertificateIndex}
                  userInfo={userInfo}
                />
              </Suspense>
              <Suspense fallback={<ProfileFormFallback />}>
                <LearnerProfileAside
                  learnerCreditBalance={learnerCreditBalance}
                  userInfo={userInfo}
                />
              </Suspense>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default UserInformation;
