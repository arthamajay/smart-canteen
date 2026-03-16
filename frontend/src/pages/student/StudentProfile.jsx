import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaLock, FaEdit, FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa';
import { updateProfile, changePassword } from '../../services/api';
import { toast } from 'react-toastify';
import './StudentProfile.css';

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    year: user.year || '',
    branch: user.branch || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const branches = [
    'Computer Science Engineering (CSE)',
    'Electronics and Communication Engineering (ECE)',
    'Electrical and Electronics Engineering (EEE)',
    'Mechanical Engineering (MECH)',
    'Civil Engineering (CIVIL)',
    'Information Technology (IT)',
    'Chemical Engineering (CHEM)',
    'Biotechnology (BT)',
  ];

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateProfile(profileForm);
      updateUser({ ...user, ...res.data });
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwForm.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSavingPw(true);
    try {
      await changePassword(pwForm);
      toast.success('Password changed successfully');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/student/dashboard')}>
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h1><FaUser /> My Profile</h1>
      </div>

      <div className="profile-content">
        {/* Avatar + summary */}
        <div className="profile-card avatar-card">
          <div className="avatar-circle">{user.name?.charAt(0).toUpperCase()}</div>
          <h2>{user.name}</h2>
          <p className="username-tag">@{user.username}</p>
          <span className="role-badge">Student</span>
          <div className="profile-meta">
            {user.year && <span>{user.year}</span>}
            {user.branch && <span>{user.branch}</span>}
          </div>
        </div>

        {/* Edit profile */}
        <div className="profile-card">
          <div className="card-header">
            <h3>Personal Information</h3>
            {!editMode && (
              <button className="edit-btn" onClick={() => setEditMode(true)}><FaEdit /> Edit</button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="form-group">
                <label><FaUser /> Full Name</label>
                <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label><FaPhone /> Phone</label>
                <input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label><FaGraduationCap /> Year</label>
                  <select value={profileForm.year} onChange={e => setProfileForm({ ...profileForm, year: e.target.value })}>
                    <option value="">Select year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label><FaGraduationCap /> Branch</label>
                  <select value={profileForm.branch} onChange={e => setProfileForm({ ...profileForm, branch: e.target.value })}>
                    <option value="">Select branch</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditMode(false)}>Cancel</button>
                <button type="submit" className="btn-save" disabled={savingProfile}>
                  <FaCheck /> {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="info-grid">
              <div className="info-item"><FaUser className="info-icon" /><div><p className="info-label">Full Name</p><p className="info-value">{user.name}</p></div></div>
              <div className="info-item"><span className="info-icon">@</span><div><p className="info-label">Username</p><p className="info-value">{user.username}</p></div></div>
              <div className="info-item"><FaEnvelope className="info-icon" /><div><p className="info-label">Email</p><p className="info-value">{user.email}</p></div></div>
              <div className="info-item"><FaPhone className="info-icon" /><div><p className="info-label">Phone</p><p className="info-value">{user.phone || '—'}</p></div></div>
              <div className="info-item"><FaGraduationCap className="info-icon" /><div><p className="info-label">Year</p><p className="info-value">{user.year || '—'}</p></div></div>
              <div className="info-item"><FaGraduationCap className="info-icon" /><div><p className="info-label">Branch</p><p className="info-value">{user.branch || '—'}</p></div></div>
            </div>
          )}
        </div>

        {/* Change password */}
        <div className="profile-card">
          <div className="card-header"><h3><FaLock /> Change Password</h3></div>
          <form onSubmit={handleChangePassword} className="profile-form">
            {[
              { key: 'current_password', label: 'Current Password' },
              { key: 'new_password', label: 'New Password' },
              { key: 'confirm_password', label: 'Confirm New Password' },
            ].map(({ key, label }) => (
              <div key={key} className="form-group">
                <label><FaLock /> {label}</label>
                <div className="input-eye">
                  <input
                    type={showPw[key.split('_')[0]] ? 'text' : 'password'}
                    value={pwForm[key]}
                    onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                    placeholder={label}
                    required
                  />
                  <button type="button" className="eye-toggle" onClick={() => setShowPw(p => ({ ...p, [key.split('_')[0]]: !p[key.split('_')[0]] }))}>
                    {showPw[key.split('_')[0]] ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            ))}
            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={savingPw}>
                {savingPw ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
