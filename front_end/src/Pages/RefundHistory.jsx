import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axiosClient from '../API/axiosClient';
import { formatVND } from '../utils/formatVND';

const RefundHistory = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRefunds: 0,
    pendingRefunds: 0,
    totalRefundAmount: 0
  });

  useEffect(() => {
    fetchRefunds();
    fetchRefundStats();
  }, []);

  const fetchRefunds = async () => {
    try {
      const response = await axiosClient.get('/seller/refunds');
      if (response.data && response.data.code === 200) {
        setRefunds(response.data.result);
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
    }
  };

  const fetchRefundStats = async () => {
    try {
      const response = await axiosClient.get('/seller/refund-stats');
      if (response.data && response.data.code === 200) {
        setStats(response.data.result);
      }
    } catch (error) {
      console.error('Error fetching refund stats:', error);
    }
  };

  const handleRefundAction = async (refundId, action) => {
    setLoading(true);
    try {
      await axiosClient.post(`/seller/refunds/${refundId}/${action}`);
      fetchRefunds();
      fetchRefundStats();
    } catch (error) {
      console.error('Error processing refund action:', error);
      alert('Failed to process refund action');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">Refund Management</h1>
          <p className="text-gray-600 mt-2">Manage and track refund requests</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FiRefreshCw size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm font-medium">Total Refunds</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.totalRefunds}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FiRefreshCw size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm font-medium">Pending Refunds</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.pendingRefunds}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FiRefreshCw size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm font-medium">Total Refund Amount</h3>
                <p className="text-2xl font-bold text-gray-800">{formatVND(stats.totalRefundAmount)}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Refund History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Refund Requests</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {refunds.map((refund) => (
                    <motion.tr
                      key={refund.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(refund.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {refund.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {refund.courseName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatVND(refund.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {refund.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          refund.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : refund.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {refund.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {refund.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRefundAction(refund.id, 'approve')}
                              disabled={loading}
                              className="text-green-600 hover:text-green-900 transform hover:scale-110 transition-transform duration-200"
                            >
                              <FiCheck size={20} />
                            </button>
                            <button
                              onClick={() => handleRefundAction(refund.id, 'reject')}
                              disabled={loading}
                              className="text-red-600 hover:text-red-900 transform hover:scale-110 transition-transform duration-200"
                            >
                              <FiX size={20} />
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RefundHistory; 
