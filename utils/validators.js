exports.validatePhone = (phone) => {
  // Supports: +255XXXXXXXXX, 0XXXXXXXXX, 255XXXXXXXXX
  const cleaned = phone.replace(/\s/g, '');
  const regex = /^(\+?255|0)[0-9]{9}$/;
  return regex.test(cleaned);
};

exports.validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

exports.validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
