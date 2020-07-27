const copy = text => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand("copy");
    if (!successful) throw "Unsuccessful copy";
  } catch (err) {
    console.error(`Error copying text: ${err}`);
  }
  document.body.removeChild(textArea);
};

export default copy;
