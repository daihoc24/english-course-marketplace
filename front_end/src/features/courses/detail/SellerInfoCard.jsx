import React from "react";
import {
  Award,
  ChevronDown,
  Clock,
  Link as LinkIcon,
  User,
  Users,
} from "lucide-react";
import { normalizeCertificateUrl, parseCertificateEntries } from "../../../utils/certificates";

const genderLabel = (gender) => {
  if (gender === "male") return "Nam";
  if (gender === "female") return "Nữ";
  return "Khác";
};

const SellerInfoCard = ({
  seller,
  expanded,
  onToggleExpanded,
  onViewSeller,
}) => {
  if (!seller) return null;

  const certificates = parseCertificateEntries(seller.certificate);
  const sellerIntro = String(seller.introduce || "");
  const shouldClampIntro = sellerIntro.length > 200;
  const introText =
    expanded || !shouldClampIntro ? sellerIntro : `${sellerIntro.substring(0, 200)}...`;

  return (
    <div className="border-b border-gray-200 py-8">
      <h2 className="mb-6 text-2xl font-bold">Thông tin người bán</h2>
      <div className="rounded-lg border bg-white p-6 transition-shadow hover:shadow-md">
        <div className="flex items-start gap-6">
          <div
            className="flex-shrink-0 cursor-pointer transition-opacity hover:opacity-80"
            onClick={() => onViewSeller(seller.id)}
          >
            {seller.avatar ? (
              <img
                src={seller.avatar}
                alt={seller.fullname}
                className="h-20 w-20 rounded-full border-2 border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <User className="h-8 w-8 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3
              className="mb-2 cursor-pointer text-xl font-bold text-blue-600 transition-colors hover:text-blue-700"
              onClick={() => onViewSeller(seller.id)}
            >
              {seller.fullname}
            </h3>

            {sellerIntro ? (
              <div className="mb-4">
                <p className="leading-relaxed text-gray-700">{introText}</p>
                {shouldClampIntro && (
                  <button
                    type="button"
                    onClick={onToggleExpanded}
                    className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    {expanded ? "Thu gọn" : "Xem thêm"}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              </div>
            ) : (
              <p className="mb-4 text-sm text-gray-500">Giảng viên tại nền tảng</p>
            )}

            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              {seller.email && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Email: </span>
                  <span className="font-medium">{seller.email}</span>
                </div>
              )}

              {seller.phone && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Điện thoại: </span>
                  <span className="font-medium">{seller.phone}</span>
                </div>
              )}

              {certificates.length > 0 && (
                <div className="md:col-span-2">
                  <div className="mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Chứng chỉ: </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {certificates.map((certificate, index) => {
                      const certificateUrl = normalizeCertificateUrl(certificate.link);
                      return (
                        <span
                          key={`${certificate.title}-${index}`}
                          className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 font-medium text-green-700"
                        >
                          {certificate.title || "Chứng chỉ"}
                          {certificateUrl && (
                            <a
                              href={certificateUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-green-800 underline-offset-2 hover:bg-white hover:underline"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <LinkIcon className="h-3.5 w-3.5" />
                              Mở liên kết
                            </a>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {seller.gender && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Giới tính: </span>
                  <span className="font-medium">{genderLabel(seller.gender)}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-8">
              <button
                type="button"
                onClick={() => onViewSeller(seller.id)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Xem hồ sơ người bán
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SellerInfoCard);
