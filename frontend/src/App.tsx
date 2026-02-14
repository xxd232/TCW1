import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { WalletDashboard } from './components/WalletDashboard';
import { SendPayment } from './components/SendPayment';
import { ReceivePayment } from './components/ReceivePayment';
import { TransactionHistory } from './components/TransactionHistory';
import { AdminDashboard } from './components/AdminDashboard';
import { BankAccounts } from './components/BankAccounts';
import { BankDeposit } from './components/BankDeposit';
import { BankWithdrawal } from './components/BankWithdrawal';
import { BankTransactions } from './components/BankTransactions';
import Chat from './components/Chat';
import VideoCall from './components/VideoCall';
import SignUp from './components/SignUp';
import Login from './components/Login';
import GoogleCallback from './components/GoogleCallback';
import CryptoChart from './components/CryptoChart';
import Modal from './components/Modal';
import Loading from './components/Loading';
import { ToastProvider, useToast } from './components/Toast';
import { api } from './services/api';
import { Currency } from './types';
import './App.css';

interface Friend {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

function App() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isLoggedIn] = useState(() => {
    // Check if user is already logged in from localStorage
    return !!localStorage.getItem('tcw1_user');
  });
  const [userId, setUserId] = useState('user-001');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [chatRecipient, setChatRecipient] = useState('');
  const [callRecipient, setCallRecipient] = useState('');
  const [activeMenu, setActiveMenu] = useState<
    'wallet' | 'receive' | 'send' | 'history' | 'chat' | 'video' | 'settings' | 'exchange' | 'notifications' | 'help' | 'admin' | 'banking' | null
  >(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [newFriendId, setNewFriendId] = useState('');
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [newFriendPhone, setNewFriendPhone] = useState('');
  const [payRecipient, setPayRecipient] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payCurrency, setPayCurrency] = useState<Currency>('USDT');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileStatus, setProfileStatus] = useState('Available');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [profileGallery, setProfileGallery] = useState<string[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleTransactionSuccess = () => {
    // Trigger refresh of wallet and transactions
    setRefreshKey(prev => prev + 1);
  };

  const startChat = (recipientId: string) => {
    setChatRecipient(recipientId);
    setShowChat(true);
  };

  const startVideoCall = (recipientId: string) => {
    setCallRecipient(recipientId);
    setShowVideoCall(true);
  };

  const toggleMenu = (
    key: 'wallet' | 'receive' | 'send' | 'history' | 'chat' | 'video' | 'settings' | 'exchange' | 'notifications' | 'help' | 'admin' | 'banking'
  ) => {
    setActiveMenu(prev => (prev === key ? null : key));
  };

  useEffect(() => {
    const saved = localStorage.getItem('tcw1_friends');
    if (saved) {
      try {
        setFriends(JSON.parse(saved));
      } catch {
        setFriends([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tcw1_friends', JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    const storedProfile = localStorage.getItem('tcw1_profile');
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        setProfileName(parsed.name || '');
        setProfileStatus(parsed.status || 'Available');
        setProfileAvatar(parsed.avatar || null);
        setProfileGallery(Array.isArray(parsed.gallery) ? parsed.gallery : []);
      } catch {
        // ignore invalid stored profile
      }
    } else {
      const storedUser = localStorage.getItem('tcw1_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setProfileName(parsedUser.firstName || parsedUser.username || parsedUser.email || '');
        } catch {
          // ignore invalid stored user
        }
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'tcw1_profile',
      JSON.stringify({
        name: profileName,
        status: profileStatus,
        avatar: profileAvatar,
        gallery: profileGallery,
      })
    );
  }, [profileName, profileStatus, profileAvatar, profileGallery]);

  const addFriend = () => {
    const trimmedId = newFriendId.trim();
    const trimmedEmail = newFriendEmail.trim();
    const trimmedPhone = newFriendPhone.trim();
    const friendKey = trimmedEmail || trimmedPhone || trimmedId;
    if (!friendKey) {
      showToast('Enter an email, phone number, or user ID', 'warning');
      return;
    }
    if (friends.some(friend => friend.id === friendKey)) {
      showToast('Friend already exists.', 'info');
      return;
    }

    const newFriend: Friend = {
      id: friendKey,
      name: newFriendName.trim() || undefined,
      email: trimmedEmail || undefined,
      phone: trimmedPhone || undefined,
    };
    setFriends(prev => [...prev, newFriend]);
    setNewFriendId('');
    setNewFriendName('');
    setNewFriendEmail('');
    setNewFriendPhone('');
    showToast(`Added ${newFriendName || friendKey} as a friend ✓`, 'success');
  };
  const handleProfileAvatarChange = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfileAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddGalleryImage = (file?: File) => {
    if (!file) return;
    if (profileGallery.length >= 4) {
      showToast('You can add up to 4 gallery photos.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileGallery(prev => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveGalleryImage = (index: number) => {
    setProfileGallery(prev => prev.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    navigate('/logout');
  };

  const removeFriend = (id: string) => {
    setFriends(prev => prev.filter(friend => friend.id !== id));
  };

  const handleQuickPay = async () => {
    if (!payRecipient) return;
    const amountValue = Number(payAmount);
    if (!amountValue || amountValue <= 0) {
      showToast('Enter a valid amount.', 'error');
      return;
    }

    try {
      setTransactionLoading(true);
      setShowTransactionModal(true);
      await api.sendPayment(userId, payCurrency, amountValue, payRecipient);
      showToast(`Payment sent: ${amountValue} ${payCurrency} ✓`, 'success');
      setRefreshKey(prev => prev + 1);
      setPayAmount('');
      setTimeout(() => setShowTransactionModal(false), 1500);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Payment failed.';
      showToast(message, 'error');
      setTimeout(() => setShowTransactionModal(false), 1000);
    } finally {
      setTransactionLoading(false);
    }
  };

  // Redirect to login if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="title-block">
            <h1>TCW1</h1>
            <p className="tagline">Send and receive Bitcoin, USDT, Ethereum & PayPal</p>
          </div>
        </div>
      </header>

      <div className="user-profile-menu">
        <button 
          className="user-avatar"
          onClick={() => setShowUserMenu(!showUserMenu)}
          title={userId}
        >
          <span className="avatar-icon">👤</span>
          <span className="avatar-text">{userId.split('-')[1]}</span>
        </button>
        {showUserMenu && (
          <div className="user-dropdown">
            <button 
              className={`user-option ${userId === 'user-001' ? 'active' : ''}`}
              onClick={() => {
                setUserId('user-001');
                setShowUserMenu(false);
              }}
            >
              👤 User 001
            </button>
            <button 
              className={`user-option ${userId === 'user-002' ? 'active' : ''}`}
              onClick={() => {
                setUserId('user-002');
                setShowUserMenu(false);
              }}
            >
              👤 User 002
            </button>
            <button 
              className={`user-option ${userId === 'user-003' ? 'active' : ''}`}
              onClick={() => {
                setUserId('user-003');
                setShowUserMenu(false);
              }}
            >
              👤 User 003
            </button>
          </div>
        )}
      </div>

      <button className="menu-toggle" onClick={() => setShowSidebar(!showSidebar)} title="Menu">
        <span className="hamburger-icon">☰</span>
      </button>

      {showSidebar && <div className="sidebar-overlay" onClick={() => setShowSidebar(false)} />}
      
      <nav className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Menu</h3>
          <button className="close-sidebar" onClick={() => setShowSidebar(false)}>✕</button>
        </div>
        <div className="sidebar-menu">
          <button
            className={`sidebar-item ${activeMenu === 'wallet' ? 'active' : ''}`}
            onClick={() => { toggleMenu('wallet'); setShowSidebar(false); }}
          >
            <span className="sidebar-icon">💼</span>
            <span className="sidebar-text">Wallet</span>
          </button>
          <button
            className={`sidebar-item ${activeMenu === 'receive' ? 'active' : ''}`}
            onClick={() => { toggleMenu('receive'); setShowSidebar(false); }}
          >
            <span className="sidebar-icon">📥</span>
            <span className="sidebar-text">Receive</span>
          </button>
          <button
            className={`sidebar-item ${activeMenu === 'send' ? 'active' : ''}`}
            onClick={() => { toggleMenu('send'); setShowSidebar(false); }}
          >
            <span className="sidebar-icon">📤</span>
            <span className="sidebar-text">Send</span>
          </button>
          <button
            className={`sidebar-item ${activeMenu === 'history' ? 'active' : ''}`}
            onClick={() => { toggleMenu('history'); setShowSidebar(false); }}
          >
            <span className="sidebar-icon">🧾</span>
            <span className="sidebar-text">History</span>
          </button>
          <button
            className={`sidebar-item ${activeMenu === 'banking' ? 'active' : ''}`}
            onClick={() => { toggleMenu('banking'); setShowSidebar(false); }}
          >
            <span className="sidebar-icon">🏦</span>
            <span className="sidebar-text">Banking</span>
          </button>
          <button
            className={`sidebar-item ${activeMenu === 'chat' ? 'active' : ''}`}
            onClick={() => { toggleMenu('chat'); setShowSidebar(false); }}
          >
            <span className="sidebar-icon">💬</span>
            <span className="sidebar-text">Chat</span>
          </button>
          <button
            className={`sidebar-item ${activeMenu === 'video' ? 'active' : ''}`}
            onClick={() => { toggleMenu('video'); setShowSidebar(false); }}
          >
            <span className="sidebar-icon">📹</span>
            <span className="sidebar-text">Video</span>
          </button>
          <button
            className={`sidebar-item ${activeMenu === 'settings' ? 'active' : ''}`}
            onClick={() => { toggleMenu('settings'); setShowSidebar(false); }}
          >
            <span className="sidebar-icon">⚙️</span>
            <span className="sidebar-text">Settings</span>
          </button>
          <button
            className={`sidebar-item ${activeMenu === 'exchange' ? 'active' : ''}`}
            onClick={() => { toggleMenu('exchange'); setShowSidebar(false); }}
          >
            <span className="sidebar-icon">💱</span>
            <span className="sidebar-text">Exchange</span>
          </button>
          <button
            className={`sidebar-item ${activeMenu === 'notifications' ? 'active' : ''}`}
            onClick={() => { toggleMenu('notifications'); setShowSidebar(false); }}
          >
            <span className="sidebar-icon">🔔</span>
            <span className="sidebar-text">Notifications</span>
          </button>
          {localStorage.getItem('isAdmin') === 'true' && (
            <button
              className={`sidebar-item ${activeMenu === 'admin' ? 'active' : ''}`}
              onClick={() => { toggleMenu('admin'); setShowSidebar(false); }}
            >
              <span className="sidebar-icon">⚙️</span>
              <span className="sidebar-text">Admin Panel</span>
            </button>
          )}
          <button
            className={`sidebar-item ${activeMenu === 'help' ? 'active' : ''}`}
            onClick={() => { toggleMenu('help'); setShowSidebar(false); }}
          >
            <span className="sidebar-icon">❓</span>
            <span className="sidebar-text">Help</span>
          </button>
        </div>
      </nav>

      <main className="app-main">

        {activeMenu === 'wallet' && (
          <section className="feature-panel">
            <div className="panel-content">
              <CryptoChart />
              <WalletDashboard userId={userId} key={refreshKey} />
            </div>
          </section>
        )}

        {activeMenu === 'receive' && (
          <section className="feature-panel">
            <div className="panel-content">
              <ReceivePayment userId={userId} onSuccess={handleTransactionSuccess} />
            </div>
          </section>
        )}

        {activeMenu === 'send' && (
          <section className="feature-panel">
            <div className="panel-content">
              <SendPayment userId={userId} onSuccess={handleTransactionSuccess} />
            </div>
          </section>
        )}

        {activeMenu === 'history' && (
          <section className="feature-panel">
            <div className="panel-content">
              <TransactionHistory userId={userId} refresh={refreshKey} />
            </div>
          </section>
        )}

        {activeMenu === 'banking' && (
          <section className="feature-panel">
            <div className="panel-content banking-panel">
              <div className="banking-tabs">
                <h2>🏦 Banking</h2>
                <p className="banking-subtitle">Link your bank account for deposits and withdrawals</p>
              </div>
              
              <div className="banking-sections">
                <div className="banking-section">
                  <BankAccounts userId={userId} />
                </div>
                
                <div className="banking-transfers">
                  <div className="banking-section">
                    <BankDeposit userId={userId} onSuccess={handleTransactionSuccess} />
                  </div>
                  
                  <div className="banking-section">
                    <BankWithdrawal userId={userId} onSuccess={handleTransactionSuccess} />
                  </div>
                </div>
                
                <div className="banking-section">
                  <BankTransactions userId={userId} />
                </div>
              </div>
            </div>
          </section>
        )}

        {(activeMenu === 'chat' || activeMenu === 'video') && (
          <section className="feature-panel">
            <div className="panel-content">
              {activeMenu === 'chat' && (
                <div className="profile-panel">
                  <div className="profile-card">
                    <div className="profile-avatar">
                      {profileAvatar ? (
                        <img src={profileAvatar} alt="Profile" />
                      ) : (
                        <div className="profile-placeholder">👤</div>
                      )}
                      {isEditingProfile && (
                        <label className="profile-upload">
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleProfileAvatarChange(e.target.files?.[0])}
                          />
                        </label>
                      )}
                    </div>
                    <div className="profile-info">
                      {isEditingProfile ? (
                        <>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="Your name"
                          />
                          <input
                            type="text"
                            value={profileStatus}
                            onChange={(e) => setProfileStatus(e.target.value)}
                            placeholder="Status"
                          />
                        </>
                      ) : (
                        <>
                          <h3>{profileName || 'Your Profile'}</h3>
                          <p>{profileStatus}</p>
                        </>
                      )}
                      <div className="profile-actions">
                        <button
                          className="primary-btn"
                          onClick={() => setIsEditingProfile(prev => !prev)}
                        >
                          {isEditingProfile ? 'Save Profile' : 'Edit Profile'}
                        </button>
                        <button className="ghost-btn" onClick={handleLogout}>Sign Out</button>
                      </div>
                    </div>
                  </div>

                  <div className="profile-gallery">
                    <div className="gallery-header">
                      <h4>Photo Gallery</h4>
                      <span>{profileGallery.length}/4</span>
                    </div>
                    <div className="gallery-grid">
                      {profileGallery.map((photo, index) => (
                        <div key={index} className="gallery-item">
                          <img src={photo} alt={`Gallery ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-photo"
                            onClick={() => handleRemoveGalleryImage(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {profileGallery.length < 4 && (
                        <label className="gallery-upload">
                          <span>+ Add photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleAddGalleryImage(e.target.files?.[0])}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="friends-panel">
                <div className="friends-header">
                  <h3>Friends</h3>
                  <p>Add friends by email, phone number, or user ID.</p>
                </div>

                <div className="friend-form">
                  <input
                    type="text"
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    placeholder="Name (optional)"
                  />
                  <input
                    type="email"
                    value={newFriendEmail}
                    onChange={(e) => setNewFriendEmail(e.target.value)}
                    placeholder="Email (recommended)"
                  />
                  <input
                    type="text"
                    value={newFriendId}
                    onChange={(e) => setNewFriendId(e.target.value)}
                    placeholder="User ID (optional)"
                  />
                  <input
                    type="tel"
                    value={newFriendPhone}
                    onChange={(e) => setNewFriendPhone(e.target.value)}
                    placeholder="Phone (optional)"
                  />
                  <button onClick={addFriend} className="primary-btn">
                    Add Friend
                  </button>
                </div>

                <div className="friend-list">
                  {friends.length === 0 ? (
                    <p className="no-friends">No friends yet. Add one above.</p>
                  ) : (
                    friends.map(friend => (
                      <div key={friend.id} className="friend-card">
                        <div className="friend-info">
                          <div className="friend-name">{friend.name || friend.email || friend.phone || friend.id}</div>
                          <div className="friend-meta">
                            {friend.email ? friend.email : friend.id}
                            {friend.phone ? ` • ${friend.phone}` : ''}
                          </div>
                        </div>
                        <div className="friend-actions">
                          <button onClick={() => startChat(friend.id)}>
                            💬 Chat
                          </button>
                          <button onClick={() => startVideoCall(friend.id)}>
                            📹 Call
                          </button>
                          <button onClick={() => setPayRecipient(friend.id)}>
                            💸 Pay
                          </button>
                          <button onClick={() => removeFriend(friend.id)}>
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {payRecipient && (
                <div className="pay-panel">
                  <div className="pay-panel-header">
                    <h4>Send payment to {payRecipient}</h4>
                    <button onClick={() => setPayRecipient('')} className="close-btn-sm">✕</button>
                  </div>
                  <div className="pay-fields">
                    <input
                      type="number"
                      min="0"
                      step="0.0001"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder="Amount"
                      disabled={transactionLoading}
                    />
                    <select
                      value={payCurrency}
                      onChange={(e) => setPayCurrency(e.target.value as Currency)}
                      disabled={transactionLoading}
                    >
                      <option value="USDT">USDT</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                      <option value="PAYPAL">PayPal</option>
                    </select>
                    <button 
                      onClick={handleQuickPay} 
                      className="primary-btn"
                      disabled={transactionLoading}
                    >
                      {transactionLoading ? 'Processing...' : 'Send Payment'}
                    </button>
                  </div>
                  <p className="pay-hint">Tip: You can also type /pay 10 USDT inside chat.</p>
                </div>
              )}

              <Modal
                isOpen={showTransactionModal}
                title={transactionLoading ? '💳 Processing Payment' : '✓ Payment Sent'}
                onClose={() => setShowTransactionModal(false)}
                showCloseButton={!transactionLoading}
                size="small"
              >
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  {transactionLoading ? (
                    <>
                      <Loading type="spinner" size="medium" text={`Sending ${payAmount} ${payCurrency}...`} />
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✓</div>
                      <h3 style={{ color: '#00FF00', margin: '0 0 10px 0' }}>Payment Successful</h3>
                      <p style={{ color: '#AAA', margin: '0' }}>
                        Sent {payAmount} {payCurrency} to {payRecipient}
                      </p>
                    </>
                  )}
                </div>
              </Modal>

              <p className="panel-help">
                Select a user to start a chat or video call.
              </p>
              <div className="communication-bar compact">
                <h3>Quick Connect</h3>
                <div className="quick-connect-btns">
                  {[...new Set(['user-001', 'user-002', 'user-003', ...friends.map(f => f.id)])]
                    .filter(id => id !== userId)
                    .map(recipientId => (
                      <div key={recipientId} className="user-connect">
                        <span>{recipientId}</span>
                        <button
                          onClick={() => startChat(recipientId)}
                          className="connect-btn chat-btn"
                          title="Start Chat"
                        >
                          <span className="icon">💬</span>
                          <span className="label">Chat</span>
                        </button>
                        <button
                          onClick={() => startVideoCall(recipientId)}
                          className="connect-btn video-btn"
                          title="Video Call"
                        >
                          <span className="icon">📹</span>
                          <span className="label">Call</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeMenu === 'settings' && (
          <section className="feature-panel">
            <div className="panel-content">
              <h3>⚙️ Settings</h3>
              <div className="settings-list">
                <div className="setting-item">
                  <label>Theme</label>
                  <select className="setting-input">
                    <option>Dark Mode</option>
                    <option>Light Mode</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Language</label>
                  <select className="setting-input">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Notifications</label>
                  <input type="checkbox" checked={true} readOnly />
                </div>
              </div>
            </div>
          </section>
        )}

        {activeMenu === 'exchange' && (
          <section className="feature-panel">
            <div className="panel-content">
              <h3>💱 Exchange</h3>
              <div className="exchange-section">
                <p>Convert between cryptocurrencies at real-time rates</p>
                <div className="exchange-form">
                  <input type="number" placeholder="Amount" className="exchange-input" />
                  <select className="exchange-select">
                    <option>BTC</option>
                    <option>ETH</option>
                    <option>USDT</option>
                  </select>
                  <span className="exchange-arrow">→</span>
                  <select className="exchange-select">
                    <option>ETH</option>
                    <option>BTC</option>
                    <option>USDT</option>
                  </select>
                  <button className="primary-btn">Exchange Now</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeMenu === 'notifications' && (
          <section className="feature-panel">
            <div className="panel-content">
              <h3>🔔 Notifications</h3>
              <div className="notifications-list">
                <div className="notification-item">
                  <p>Payment received from user-002</p>
                  <span className="notification-time">2 hours ago</span>
                </div>
                <div className="notification-item">
                  <p>New message from user-003</p>
                  <span className="notification-time">5 hours ago</span>
                </div>
                <div className="notification-item">
                  <p>Exchange rate updated</p>
                  <span className="notification-time">1 day ago</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeMenu === 'admin' && (
          <section className="feature-panel">
            <AdminDashboard />
          </section>
        )}

        {activeMenu === 'help' && (
          <section className="feature-panel">
            <div className="panel-content">
              <h3>❓ Help & Support</h3>
              <div className="help-section">
                <div className="help-item">
                  <h4>How do I send a payment?</h4>
                  <p>Click on Send, select a recipient, enter the amount, and confirm.</p>
                </div>
                <div className="help-item">
                  <h4>How do I start a video call?</h4>
                  <p>Go to Video menu, click on a friend, and click Start Call.</p>
                </div>
                <div className="help-item">
                  <h4>What are the supported currencies?</h4>
                  <p>Bitcoin (BTC), Ethereum (ETH), USDT, and PayPal.</p>
                </div>
                <button className="primary-btn">Contact Support</button>
              </div>
            </div>
          </section>
        )}
      </main>

      {showChat && chatRecipient && (
        <Chat 
          currentUserId={userId}
          recipientId={chatRecipient}
          onClose={() => setShowChat(false)}
        />
      )}

      {showVideoCall && callRecipient && (
        <VideoCall 
          currentUserId={userId}
          recipientId={callRecipient}
          onClose={() => setShowVideoCall(false)}
        />
      )}

      <footer className="app-footer">
        <p>© 2024 TCW1 - Interactive Payment Wallet</p>
        <p className="disclaimer">
          Demo application - Not for production use. Cryptocurrency transactions are simulated.
        </p>
      </footer>
    </div>
  );
}

function AppWrapper() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="auth-wrapper">
      <Login
        onLoginSuccess={() => navigate('/')}
        onShowSignUp={() => navigate('/signup')}
      />
    </div>
  );
}

function SignUpPage() {
  const navigate = useNavigate();
  const handleSignUp = (userId: string, email: string) => {
    localStorage.setItem('tcw1_user', JSON.stringify({ username: userId, email }));
    navigate('/');
  };

  return (
    <div className="auth-wrapper">
      <SignUp
        onSignUp={handleSignUp}
        onShowLogin={() => navigate('/login')}
      />
    </div>
  );
}

function LogoutPage() {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.removeItem('tcw1_token');
    localStorage.removeItem('tcw1_user');
    localStorage.removeItem('isAdmin');
    navigate('/login', { replace: true });
  }, [navigate]);

  return <Loading type="spinner" size="medium" text="Logging out..." />;
}

export default AppWrapper;
