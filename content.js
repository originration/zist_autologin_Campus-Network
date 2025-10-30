// 页面加载完成后尝试自动登录
window.addEventListener('load', function() {
  // 先检查是否有重新登录提示
  checkReloginPrompt();
  
  // 然后尝试自动登录
  autoLogin();
});

// 接收来自popup的登录指令
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "autoLogin") {
    checkReloginPrompt();
    autoLogin();
    sendResponse({status: "已执行自动登录"});
  }
});

// 检查是否有重新登录提示并处理
function checkReloginPrompt() {
  try {
    // 获取提示信息元素
    const messageElement = document.evaluate(
      '/html/body/div/div/div[2]/div[1]/form/div',
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    
    // 获取返回按钮元素
    const backButton = document.evaluate(
      '/html/body/div/div/div[2]/div[1]/form/input',
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    
    // 检查提示信息中是否包含"重新登录"字样
    if (messageElement && backButton && messageElement.textContent.includes("重新登录")) {
      console.log('检测到重新登录提示，将点击返回按钮');
      
      // 点击返回按钮
      backButton.click();
      
      // 延迟一段时间后再次尝试登录
      setTimeout(autoLogin, 1000);
    }
  } catch (error) {
    console.log('未检测到重新登录提示或处理时出错:', error);
  }
}

// 自动登录核心函数
function autoLogin() {
  // 获取保存的登录信息
  chrome.storage.sync.get(['studentId', 'password', 'isp'], function(data) {
    if (!data.studentId || !data.password || !data.isp) {
      console.log('请先在插件中设置登录信息');
      return;
    }

    try {
      // 填充学号
      const studentInput = document.evaluate(
        '/html/body/div/div/div[3]/div[1]/div/div[2]/div[1]/div/form/input[2]',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      // 填充密码
      const passwordInput = document.evaluate(
        '/html/body/div/div/div[3]/div[1]/div/div[2]/div[1]/div/form/input[3]',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      // 选择运营商
      let ispXpath;
      switch(data.isp) {
        case 'cucc':
          ispXpath = '/html/body/div/div/div[3]/div[1]/div/div[2]/div[1]/div/div[4]/span[3]/input';
          break;
        case 'cmcc':
          ispXpath = '/html/body/div/div/div[3]/div[1]/div/div[2]/div[1]/div/div[4]/span[2]/input';
          break;
        case 'cmc':
          ispXpath = '/html/body/div/div/div[3]/div[1]/div/div[2]/div[1]/div/div[4]/span[4]/input';
          break;
      }

      const ispInput = document.evaluate(
        ispXpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      // 获取登录按钮
      const loginButton = document.evaluate(
        '/html/body/div/div/div[3]/div[1]/div/div[2]/div[1]/div/form/input[1]',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      // 执行登录操作
      if (studentInput && passwordInput && ispInput && loginButton) {
        studentInput.value = data.studentId;
        passwordInput.value = data.password;
        
        if (!ispInput.checked) {
          ispInput.click();
        }

        // 延迟点击，确保表单已填充完成
        setTimeout(() => {
          loginButton.click();
          
          // 登录后再次检查是否需要重新登录
          setTimeout(checkReloginPrompt, 1500);
        }, 500);
      } else {
        console.log('未找到登录元素，可能不在认证页面');
      }
    } catch (error) {
      console.error('自动登录出错:', error);
    }
  });
}
    