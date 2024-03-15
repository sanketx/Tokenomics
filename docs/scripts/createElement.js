export function createMessageWrapper() {
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message');
    return messageWrapper;
}

export function createAvatar(imagePath) {
    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
    avatar.style.backgroundImage = `url(${imagePath})`;
    return avatar;
}

export function createMessageBubble(text, className) {
    const messageBubble = document.createElement('div');
    messageBubble.classList.add(className);
    messageBubble.textContent = text;
    return messageBubble;
}