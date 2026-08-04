import React, { useState } from "react";
import { FaLock, FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import { formatVND } from "../utils/formatVND";

const CheckoutPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    country: "",
    address: "",
    paymentMethod: "credit",
    cardNumber: "",
    cvv: "",
    expiryDate: "",
    discountCode: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sample course items for payment
  const courseItems = [
    {
      id: 1,
      name: "Premium Leather Jacket",
      size: "L",
      color: "Brown",
      quantity: 1,
      price: 299000,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5"
    },
    {
      id: 2,
      name: "Designer Sneakers",
      size: "42",
      color: "White",
      quantity: 2,
      price: 159000,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
    }
  ];

  const paymentMethods = [
    { id: "credit", name: "Credit Card/Visa" },
    { id: "momo", name: "MoMo" },
    { id: "paypal", name: "PayPal" }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.paymentMethod) newErrors.paymentMethod = "Payment method is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateSubtotal = () => {
    return courseItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const discounts = 0; // Replace with actual discount calculation if needed

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setShowSuccess(true);
      } catch (error) {
        console.error("Payment processing failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Checkout title and Cancel button */}
      <div className="bg-gray-200 p-4 flex justify-between items-center border border-gray-300">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Thanh toán</h1>
        </div>
        <button 
          className="text-black hover:text-gray-700"
          onClick={() => window.history.back()}
        >
          Hủy
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 bg-white">
        {/* Left Column - Form (2/3 width) */}
        <div className="col-span-2 p-6 border-r border-gray-200">
          <form onSubmit={handleSubmit}>
            {/* Billing Address */}
            <div className="mb-6">
              <h3 className="text-base font-bold mb-3">Billing Address</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <div className="relative">
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="block w-full rounded border border-gray-300 px-3 py-2 pr-8 appearance-none bg-white"
                  >
                    <option value="">Choose your country</option>
                    <option value="us">United States</option>
                    <option value="ca">Canada</option>
                    <option value="vn">Vietnam</option>
                    {/* Add more countries as needed */}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <h3 className="text-base font-bold mb-3">Payment Method</h3>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    className="border border-gray-300 rounded p-2"
                  >
                    <label className="flex items-center justify-between cursor-pointer w-full">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={() => setFormData({...formData, paymentMethod: method.id})}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">{method.name}</span>
                      </div>
                      <div className="bg-white px-2 py-1 text-xs border border-gray-200 rounded">
                        LOGO
                      </div>
                    </label>
                    
                    {formData.paymentMethod === method.id && method.id === "momo" && (
                      <div className="mt-4 p-4 border-t border-gray-200">
                        <h4 className="text-center font-medium text-lg mb-4">Scan QR to pay</h4>
                        <div className="flex justify-center">
                          <img 
                            src="/api/placeholder/200/200" 
                            alt="MoMo QR Payment" 
                            className="w-48 h-48"
                          />
                        </div>
                        <p className="text-center mt-4 text-sm text-gray-600">
                          Scan this QR code with your MoMo app to complete payment
                        </p>
                      </div>
                    )}
                    
                    {formData.paymentMethod === method.id && method.id === "credit" && (
                      <div className="mt-4 p-4 border-t border-gray-200">
                        <h4 className="text-center font-medium text-lg mb-4">Payment input</h4>
                        <div className="space-y-4">
                          <input
                            type="text"
                            placeholder="Card Number"
                            className="block w-full rounded-md border border-gray-300 px-3 py-2"
                            value={formData.cardNumber}
                            onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="block w-full rounded-md border border-gray-300 px-3 py-2"
                              value={formData.expiryDate}
                              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                            />
                            <input
                              type="text"
                              placeholder="CVV"
                              className="block w-full rounded-md border border-gray-300 px-3 py-2"
                              value={formData.cvv}
                              onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {formData.paymentMethod === method.id && method.id === "zalo" && (
                      <div className="mt-4 p-4 border-t border-gray-200">
                        <h4 className="text-center font-medium text-lg mb-4">Redirecting to Paypal</h4>
                        <p className="text-center text-sm text-gray-600">
                          You will be redirected to Paypal to complete your payment
                        </p>
                        <div className="mt-4 flex justify-center">
                          <button 
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            onClick={() => window.open("https://www.paypal.com/", "_blank")}
                          >
                            Continue to Paypal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div className="mb-6">
              <h3 className="text-base font-bold mb-3">Order Details</h3>
              <div className="space-y-2">
                {courseItems.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between border border-gray-300 rounded p-2"
                  >
                    <div className="flex items-center">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded mr-2" 
                      />
                      <span>{item.name}</span>
                    </div>
                    <div className="text-right">
                      {formatVND(item.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Right Column - Order Summary (1/3 width) */}
        <div className="bg-gray-100 p-6">
          <h3 className="text-lg font-bold mb-4">Order summary</h3>
          <div className="bg-white p-4 rounded mb-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Giá gốc:</span>
                <span>{formatVND(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Giảm giá:</span>
                <span>{formatVND(discounts)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Tổng cộng:</span>
                <span>{formatVND(calculateTotal())}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Pay"}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md">
            <h3 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h3>
            <p className="text-gray-600 mb-6">Thank you for your purchase. We'll send you a confirmation email shortly.</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
