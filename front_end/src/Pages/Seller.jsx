import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiUsers, FiDollarSign, FiSettings, FiCreditCard, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Seller = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Dashboard',
      description: 'View your course statistics and manage your courses',
      icon: <FiBook size={24} />,
      path: '/seller/dashboard',
      color: 'blue'
    },
    {
      title: 'Students',
      description: 'Manage your students and track their progress',
      icon: <FiUsers size={24} />,
      path: '/seller/students',
      color: 'green'
    },
    {
      title: 'Wallet',
      description: 'Manage your earnings and withdrawals',
      icon: <FiCreditCard size={24} />,
      path: '/seller/wallet',
      color: 'purple'
    },
    {
      title: 'Refunds',
      description: 'Manage and track refund requests',
      icon: <FiRefreshCw size={24} />,
      path: '/seller/refunds',
      color: 'yellow'
    },
    {
      title: 'Settings',
      description: 'Configure your seller account settings',
      icon: <FiSettings size={24} />,
      path: '/seller/settings',
      color: 'red'
    }
  ];

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Seller Portal</h1>
          <p className="text-gray-600 text-lg">Welcome to your teaching dashboard</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {menuItems.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-200 hover:shadow-xl`}
            >
              <div className={`p-3 rounded-full bg-${item.color}-100 text-${item.color}-600 w-fit mb-4`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-800">
              support@example.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Seller; 