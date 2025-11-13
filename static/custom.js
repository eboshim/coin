class UIControls {
  static initThemeSwitcher() {
    const storedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-bs-theme', storedTheme);
    const themeSwitcher = document.getElementById('themeSwitcher');
    if (!themeSwitcher) return;
    const icon = themeSwitcher.querySelector('i');
    icon.className = storedTheme === 'dark' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
    themeSwitcher.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-bs-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-bs-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      icon.className = newTheme === 'dark' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
    });
  }

  static initContainerSwitcher() {
    const container = document.body.querySelector(':where(.container-lg, .container-fluid)');
    const containerSwitcher = document.getElementById('containerSwitcher');
    if (!containerSwitcher || !container) return;
    const icon = containerSwitcher.querySelector('i');
    const containerIcons = {
      'container-lg': 'bi bi-arrows-expand-vertical',
      'container-fluid': 'bi bi-arrows-collapse-vertical',
    };
    const storedClass = localStorage.getItem('containerClass')
      || (container.classList.contains('container-fluid') ? 'container-fluid' : 'container-lg');
    container.classList.toggle('container-lg', storedClass === 'container-lg');
    container.classList.toggle('container-fluid', storedClass === 'container-fluid');
    icon.className = containerIcons[storedClass];
    containerSwitcher.addEventListener('click', () => {
      const newClass = container.classList.contains('container-lg') ? 'container-fluid' : 'container-lg';
      container.classList.toggle('container-lg', newClass === 'container-lg');
      container.classList.toggle('container-fluid', newClass === 'container-fluid');
      icon.className = containerIcons[newClass];
      localStorage.setItem('containerClass', newClass);
    });
  }
}

class Base64Util {
  static encode(str) {
    return btoa(str);
  }

  static decode(str) {
    return atob(str);
  }

  static encodeUrl(str) {
    return this.encode(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  static decodeUrl(str) {
    let s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) {
      s += '=';
    }
    return this.decode(s);
  }
}

class ParamsManager {
  static DEFAULT_URL = 'https://t.me/giftfest_bot/app?startapp';

  constructor() {
    this.urlInput = document.getElementById('urlInput');
    this.copyButton = document.getElementById('copyUrlButton');
    this.copyIcon = document.getElementById('copyIcon');
    this.parseButton = document.getElementById('parseUrlButton');
    this.parseError = document.getElementById('parseError');
    this.form = document.getElementById('paramsForm');
    this.paramsContainer = document.getElementById('paramsContainer');
    this.addButton = document.getElementById('addParamButton');
    this.urlSafeToggle = document.getElementById('urlSafeToggle');
    this.base64Label = document.getElementById('base64Label');
    this.base64Encoded = document.getElementById('base64Encoded');
    this.httpQuery = document.getElementById('httpQuery');
    this.goMap = document.getElementById('goMap');
  }

  init() {
    // Восстанавливаем базовый URL из localStorage
    const savedBaseUrl = localStorage.getItem('baseUrl');
    if (savedBaseUrl) {
      this.urlInput.value = savedBaseUrl;
    } else if (!this.urlInput.value.trim()) {
      // Если значение пустое, устанавливаем значение по умолчанию
      this.urlInput.value = ParamsManager.DEFAULT_URL;
    }
    
    this.copyButton.addEventListener('click', () => this.copyURL());
    this.parseButton.addEventListener('click', () => this.parseURL());
    this.addButton.addEventListener('click', () => this.addParamField());
    this.paramsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-param')) {
        this.removeParamField(e.target);
      }
    });
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.generateEncoded(false);
    });
    this.urlSafeToggle.addEventListener('change', () => {
      this.base64Label.textContent = this.urlSafeToggle.checked ? 'Base64url Encode:' : 'Base64 Encode:';
      this.generateEncoded(true);
    });
  }

  copyURL() {
    this.urlInput.select();
    const button = this.copyIcon.parentElement;
    navigator.clipboard.writeText(this.urlInput.value).then(() => {
      this.copyIcon.classList.remove('bi-copy');
      this.copyIcon.classList.add('bi-check-square-fill');
      button.classList.remove('btn-outline-secondary');
      button.classList.add('btn-success');
      setTimeout(() => {
        this.copyIcon.classList.remove('bi-check-square-fill');
        this.copyIcon.classList.add('bi-copy');
        button.classList.remove('btn-success');
        button.classList.add('btn-outline-secondary');
      }, 1000);
    }).catch(() => {
      const button = this.copyIcon.parentElement;
      this.copyIcon.classList.replace('bi-copy', 'bi-exclamation-triangle-fill');
      button.classList.replace('btn-outline-secondary', 'btn-danger');
      setTimeout(() => {
        this.copyIcon.classList.replace('bi-exclamation-triangle-fill', 'bi-copy');
        button.classList.replace('btn-danger', 'btn-outline-secondary');
      }, 1500);
    });
  }

  parseURL() {
    let urlValue = this.urlInput.value;
    this.urlInput.classList.remove('is-invalid');
    try {
      // Ищем startapp в строке
      const startappIndex = urlValue.toLowerCase().indexOf('startapp');
      if (startappIndex === -1) {
        this.urlInput.classList.add('is-invalid');
        this.parseError.innerHTML = 'В строке не найден startapp';
        return;
      }
      
      // Проверяем что идет после startapp
      const afterStartapp = urlValue.substring(startappIndex + 'startapp'.length);
      if (afterStartapp === '') {
        // Если после startapp ничего нет - считаем urlValue пустым
        urlValue = '';
      } else if (afterStartapp.startsWith('=')) {
        // Если после startapp идет = - берем все после =
        urlValue = afterStartapp.substring(1);
      } else {
        // Иначе ошибка
        this.urlInput.classList.add('is-invalid');
        this.parseError.innerHTML = 'Не удалось распарсить, звоните фиксикам';
        return;
      }
      
      // Сохраняем базовую часть URL (до startapp включительно) в localStorage
      const baseUrl = this.urlInput.value.substring(0, startappIndex + 'startapp'.length);
      localStorage.setItem('baseUrl', baseUrl);
      
      try {
        urlValue = this.urlSafeToggle.checked ? Base64Util.decodeUrl(urlValue) : Base64Util.decode(urlValue);
      } catch (e) {
        console.warn('Failed to decode base64:', e);
        this.urlInput.classList.add('is-invalid');
        this.parseError.innerHTML = 'Не удалось распарсить, звоните фиксикам';
        return;
      }
      const params = new URLSearchParams(urlValue.includes('?') ? urlValue.split('?')[1] : urlValue);
      this.paramsContainer.innerHTML = '';
      params.forEach((value, key) => {
        this.addParamField(key, value);
      });
      this.parseError.innerHTML = '';
      this.urlInput.classList.remove('is-invalid');
      this.generateEncoded(true);
    } catch (e) {
      console.error('Parse URL error:', e);
      this.urlInput.classList.add('is-invalid');
      this.parseError.innerHTML = 'Невалидный URL';
    }
  }

  addParamField(key = '', value = '') {
    const row = document.createElement('div');
    row.classList.add('row', 'mb-2', 'param-row');
    row.innerHTML = `
        <div class="col">
            <input type="text" class="form-control" placeholder="Key" name="key[]" value="${key}" required>
            <div class="invalid-feedback"></div>
        </div>
        <div class="col">
            <input type="text" class="form-control" placeholder="Value" name="value[]" value="${value}" required>
            <div class="invalid-feedback"></div>
        </div>
        <div class="col-auto">
            <button type="button" class="btn btn-danger remove-param">x</button>
        </div>
    `;
    this.paramsContainer.appendChild(row);
  }

  removeParamField(button) {
    button.closest('.param-row').remove();
  }

  generateEncoded(skipURL) {
    const errEmpty = 'пустое';
    const errSpace = 'пробелы';
    let isValid = true;

    this.form.querySelectorAll("input[name='key[]']").forEach((keyInput) => {
      const key = keyInput.value.trim();
      const feedback = keyInput.nextElementSibling;
      if (key === '') {
        feedback.textContent = errEmpty;
        keyInput.setCustomValidity(errEmpty);
        isValid = false;
      } else if (/\s/.test(key)) {
        feedback.textContent = errSpace;
        keyInput.setCustomValidity(errSpace);
        isValid = false;
      } else {
        feedback.textContent = '';
        keyInput.setCustomValidity('');
      }
    });

    this.form.querySelectorAll("input[name='value[]']").forEach((valueInput) => {
      const val = valueInput.value.trim();
      const feedback = valueInput.nextElementSibling;
      if (val === '') {
        feedback.textContent = errEmpty;
        valueInput.setCustomValidity(errEmpty);
        isValid = false;
      } else if (/\s/.test(val)) {
        feedback.textContent = errSpace;
        valueInput.setCustomValidity(errSpace);
        isValid = false;
      } else {
        feedback.textContent = '';
        valueInput.setCustomValidity('');
      }
    });

    if (!isValid || !this.form.checkValidity()) {
      this.form.classList.add('was-validated');
      return;
    }

    const queryParams = new URLSearchParams();
    let goMap = 'map[string]string{\n';

    const mapping = {
      utm_source: 'US',
      utm_medium: 'UM',
      utm_campaign: 'UCP',
      utm_content: 'UC',
      utm_term: 'UT',
      ref_code: 'RC',
    };

    this.form.querySelectorAll("input[name='key[]']").forEach((keyInput, index) => {
      let key = keyInput.value.trim();
      if (Object.prototype.hasOwnProperty.call(mapping, key)) {
        key = mapping[key];
      }
      const value = this.form.querySelectorAll("input[name='value[]']")[index].value.trim();
      queryParams.append(key, value);
      goMap += `    "${key}": "${value}",\n`;
    });
    goMap += '}';

    const encoded = this.urlSafeToggle.checked
      ? Base64Util.encodeUrl(queryParams.toString())
      : Base64Util.encode(queryParams.toString());
    this.base64Encoded.textContent = encoded;
    this.httpQuery.textContent = queryParams.toString();
    this.goMap.textContent = goMap;

    if (skipURL !== true) {
      const currentUrl = this.urlInput.value;
      const startappIndex = currentUrl.toLowerCase().indexOf('startapp');
      if (startappIndex !== -1) {
        // Берем все до startapp + startapp= + encoded
        const beforeStartapp = currentUrl.substring(0, startappIndex);
        this.urlInput.value = `${beforeStartapp}startapp=${encoded}`;
      } else {
        // Если startapp не найден, показываем ошибку
        this.urlInput.classList.add('is-invalid');
        this.parseError.innerHTML = 'В строке не найден startapp';
      }
    }
  }
}

class RefCodeConverter {
  constructor() {
    this.telegramId = document.getElementById('telegramId');
    this.referralCode = document.getElementById('referralCode');
    this.error = document.getElementById('conversionError');
    this.toRcButton = document.getElementById('toRcButton');
    this.toIdButton = document.getElementById('toIdButton');
  }

  init() {
    this.toRcButton.addEventListener('click', () => this.convertToRC());
    this.toIdButton.addEventListener('click', () => this.convertToId());
  }

  convertToRC() {
    this.telegramId.classList.remove('is-invalid');
    try {
      const id = parseInt(this.telegramId.value, 10);
      if (isNaN(id) || id <= 0) {
        throw new Error('Некорректный ID');
      }
      let rc = Base62.encode(id);
      rc = rc.padStart(11, '0');
      this.referralCode.value = rc;
      this.error.innerHTML = '';
    } catch (e) {
      this.telegramId.classList.add('is-invalid');
      this.error.innerHTML = e.message;
    }
  }

  convertToId() {
    this.referralCode.classList.remove('is-invalid');
    try {
      const rc = this.referralCode.value.trim();
      if (!rc) {
        throw new Error('Введите код');
      }
      if (!/^[0-9A-Za-z]+$/.test(rc)) {
        throw new Error('Некорректный код');
      }
      if (rc.length > 11) {
        throw new Error('Код слишком длинный');
      }
      const id = Base62.decode(rc); // кинет ошибку при чужих символах
      this.telegramId.value = id;
      this.error.innerHTML = '';
    } catch (e) {
      this.referralCode.classList.add('is-invalid');
      this.error.innerHTML = e.message;
    }
  }
}

class MarkdownConverter {
  constructor() {
    this.textInput = document.getElementById('markdownText');
    this.urlInput = document.getElementById('markdownUrl');
    this.resultInput = document.getElementById('markdownResult');
    this.convertButton = document.getElementById('convertMarkdownButton');
    this.copyButton = document.getElementById('copyMarkdownButton');
    this.copyIcon = document.getElementById('copyMarkdownIcon');
  }

  init() {
    this.convertButton.addEventListener('click', () => this.convert());
    this.copyButton.addEventListener('click', () => this.copy());
  }

  convert() {
    const text = this.textInput.value;
    const url = this.urlInput.value;
    if (!text || !url) {
      this.resultInput.value = '';
      return;
    }
    this.resultInput.value = `[${text}](${url})`;
  }

  copy() {
    if (!this.resultInput.value) return;
    navigator.clipboard.writeText(this.resultInput.value).then(() => {
      this.copyIcon.classList.remove('bi-copy');
      this.copyIcon.classList.add('bi-check');
      setTimeout(() => {
        this.copyIcon.classList.remove('bi-check');
        this.copyIcon.classList.add('bi-copy');
      }, 1000);
    }).catch(() => {
      this.copyIcon.classList.replace('bi-copy', 'bi-exclamation-triangle-fill');
      setTimeout(() => {
        this.copyIcon.classList.replace('bi-exclamation-triangle-fill', 'bi-copy');
      }, 1500);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  UIControls.initThemeSwitcher();
  UIControls.initContainerSwitcher();
  const params = new ParamsManager();
  params.init();
  new RefCodeConverter().init();
  new MarkdownConverter().init();
});

