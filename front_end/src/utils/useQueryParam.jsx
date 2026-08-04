// src/hooks/useQueryParam.js
import { useSearchParams } from "react-router-dom";

const useQueryParam = (key) => {
  const [searchParams] = useSearchParams();
  return searchParams.get(key);
};

export default useQueryParam;