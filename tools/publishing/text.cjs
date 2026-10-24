function decodeUtf8(bytes, context) {
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (error) {
    throw new Error(`${context} must contain valid UTF-8 source bytes`, { cause: error });
  }
  if (text.includes('\0')) {
    throw new Error(`${context} contains an unsupported NUL character`);
  }
  return text;
}

module.exports = { decodeUtf8 };
