import { useEffect } from "react";

const FacebookComment = ({ url }) => {
  useEffect(() => {
    // Load lại plugin khi component mount (đặc biệt nếu URL thay đổi)
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, [url]);

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Bình luận facebook</h2>
        <div class="fb-comments" 
            data-href={url}
            data-width="100%" 
            data-numposts="5"></div>
    </div>

  );
};

export default FacebookComment;