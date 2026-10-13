// Flow Director Companion Content Script for flow.google
(function() {
  'use strict';

  function createFloatingButton() {
    if (document.getElementById('flow-director-floating-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'flow-director-floating-btn';
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px">
        <path d="m22 8-6 4 6 4V8Z"/>
        <rect width="14" height="12" x="2" y="6" rx="2"/>
      </svg>
      <span>Paste from Flow Director</span>
    `;

    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '999999',
      display: 'flex',
      alignItems: 'center',
      padding: '10px 18px',
      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '13px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '50px',
      cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45)',
      transition: 'all 0.2s ease',
      letterSpacing: '0.2px'
    });

    btn.onmouseenter = () => {
      btn.style.transform = 'translateY(-2px) scale(1.02)';
      btn.style.boxShadow = '0 12px 28px rgba(99, 102, 241, 0.6)';
    };

    btn.onmouseleave = () => {
      btn.style.transform = 'translateY(0) scale(1)';
      btn.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.45)';
    };

    btn.onclick = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (!text) {
          showNotification('⚠️ ไม่พบข้อความใน Clipboard', '#ef4444');
          return;
        }

        const inputEl = document.querySelector('textarea, [contenteditable="true"], input[type="text"]');
        if (inputEl) {
          inputEl.focus();
          if (inputEl.tagName === 'TEXTAREA' || inputEl.tagName === 'INPUT') {
            inputEl.value = text;
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            inputEl.innerText = text;
            inputEl.dispatchEvent(new InputEvent('input', { bubbles: true }));
          }
          showNotification('✨ วาง Prompt จาก Flow Director เรียบร้อย!', '#10b981');
        } else {
          showNotification('💡 กรุณากดคลิกเลือกช่อง Prompt ใน Flow ก่อนกดปุ่มนี้ครับ', '#f59e0b');
        }
      } catch (err) {
        showNotification('⚠️ กรุณาอนุญาตสิทธิ์เข้าถึง Clipboard ในเบราว์เซอร์', '#ef4444');
      }
    };

    document.body.appendChild(btn);
  }

  function showNotification(msg, bgColor) {
    const toast = document.createElement('div');
    toast.innerText = msg;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '75px',
      right: '24px',
      zIndex: '1000000',
      padding: '8px 16px',
      background: bgColor || '#1e293b',
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontWeight: '600',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      transition: 'opacity 0.3s ease'
    });
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingButton);
  } else {
    createFloatingButton();
  }
})();
