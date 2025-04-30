import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Alert.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faCircleCheck,
  faCircleInfo,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';

const Alert = ({ type, message, onClose, redirectTo }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if ((type === 'info' || type === 'success') && redirectTo) {
      const timer = setTimeout(() => {
        onClose?.();
        navigate(redirectTo);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (type === 'info') {
      const timer = setTimeout(() => onClose?.(), 2000);
      return () => clearTimeout(timer);
    }
  }, [type, onClose, redirectTo, navigate]);

  const handleClose = () => {
    onClose?.();
    if (redirectTo && type === 'success') navigate(redirectTo);
  };

  const iconMap = {
    error: faCircleExclamation,
    info: faCircleInfo,
    success: faCircleCheck,
  };

  return (
    <>
      {(type === 'error' || type === 'success') && (
        <div className="alert-overlay" />
      )}
      <div className={`alert ${type}`}>
        {(type === 'error' || type === 'success') && (
          <button className="close-btn" onClick={handleClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
        <FontAwesomeIcon icon={iconMap[type]} className="alert-icon" />
        <p className="alert-message">{message}</p>
      </div>
    </>
  );
};

export default Alert;
