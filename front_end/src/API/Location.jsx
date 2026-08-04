import React, { useEffect, useState } from "react";

const ProvinceSelect = ({ formData, setFormData, errors }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);


  useEffect(() => {
    fetch("https://esgoo.net/api-tinhthanh/1/0.htm")
      .then((res) => res.json())
      .then((data) => {
        if (data.error === 0 && Array.isArray(data.data)) {
          setProvinces(data.data);
        } else {
          console.error("Dữ liệu tỉnh thành không hợp lệ");
        }
      })
      .catch((err) => console.error("Lỗi khi lấy tỉnh thành:", err));
  }, []);

  useEffect(() => {
    if (formData.provinceId) {
      fetch(`https://esgoo.net/api-tinhthanh/2/${formData.provinceId}.htm`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error === 0 && Array.isArray(data.data)) {
            setDistricts(data.data);
          }else{
            console.error("Dữ liệu phường xã không hợp lệ");
          }
        })
        .catch((err) => console.error("Lỗi khi lấy quận/huyện:", err));
    } else {
      setDistricts([]);
    }
  }, [formData.provinceId]);


  useEffect(() => {
    if(formData.districtId) {
      fetch(`https://esgoo.net/api-tinhthanh/3/${formData.districtId}.htm`)
        .then((response) => response.json())
        .then((data) => {
            if(data.error ===0 && Array.isArray(data.data)){
                setWards(data.data);
            }else{
                console.error("Dữ liệu phường/xã không hợp lệ");
            }
        })
        .catch((err) => console.error("Lỗi khi lấy phường/xã:", err));
    }
  });

  return (
    <>
      {/* Tỉnh/Thành + Quận/Huyện */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tỉnh/Thành */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành Phố</label>
          <select
            className={`mt-1 block w-full rounded-md border ${
              errors.province ? "border-red-500" : "border-gray-300"
            } px-3 py-2`}
            value={formData.province}
            onChange={(e) =>{
              const selectedProvince = provinces.find(p => p.full_name === e.target.value);
              setFormData({ ...formData, province: selectedProvince.full_name,provinceId: selectedProvince.id, district: "", ward: "" });
            }
            }
          >
            <option value="">Chọn Tỉnh/Thành</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.full_name}>
                {province.name}
              </option>
            ))}
          </select>
          {errors.province && (
            <p className="text-red-500 text-sm mt-1">{errors.province}</p>
          )}
        </div>

        {/* Quận/Huyện (hiện chưa load từ API) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Quận/Huyện</label>
          <select
            className={`mt-1 block w-full rounded-md border ${
              errors.district ? "border-red-500" : "border-gray-300"
            } px-3 py-2`}
            value={formData.district}
            onChange={(e) => {
              const selectedDistrict = districts.find(d => d.full_name === e.target.value);
              setFormData({ ...formData, district: selectedDistrict.full_name, districtId: selectedDistrict.id });
            }}
          >
            <option value="">Chọn Quận/Huyện</option>
            {districts.map((district) =>(
                <option key={district.id} value={district.full_name}>
                {district.name}
              </option>
            ))}
          </select>
          {errors.district && (
            <p className="text-red-500 text-sm mt-1">{errors.district}</p>
          )}
        </div>
      </div>

      {/* Phường/Xã (hiện chưa load từ API) */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Phường/Xã</label>
        <select
          className={`mt-1 block w-full rounded-md border ${
            errors.ward ? "border-red-500" : "border-gray-300"
          } px-3 py-2`}
          value={formData.ward}
          onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
        >
          <option value="">Chọn Phường/Xã</option>
          {wards.map((wards) =>(
            <option key={wards.id} value={wards.full_name}>{wards.name}</option>
          ))}
        </select>
        {errors.ward && (
          <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
        )}
      </div>
    </>
  );
};

export default ProvinceSelect;
