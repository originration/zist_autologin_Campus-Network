// 页面加载时读取保存的信息
document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get(['studentId', 'password', 'isp'], function(data) {
    if (data.studentId) document.getElementById('studentId').value = data.studentId;
    if (data.password) document.getElementById('password').value = data.password;
    if (data.isp) document.getElementById('isp').value = data.isp;
  });

  // 保存信息并触发自动登录
  document.getElementById('saveBtn').addEventListener('click', function() {
    const studentId = document.getElementById('studentId').value;
    const password = document.getElementById('password').value;
    const isp = document.getElementById('isp').value;

    if (!studentId || !password) {
      alert('请输入学号和密码');
      return;
    }

    // 保存信息
    chrome.storage.sync.set({
      studentId: studentId,
      password: password,
      isp: isp
    }, function() {
      alert('信息已保存，将尝试自动登录');
      
      // 向当前标签页发送登录指令
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "autoLogin"});
      });
    });
  });
});
    