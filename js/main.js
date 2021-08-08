


const darkModeButton = document.querySelector('.switch > input');

darkModeButton.addEventListener('click', () => {

    const b = document.body;

    if (b.classList.contains('light')) {
        b.classList.add('dark');
        b.classList.remove('light');
    } else {
        b.classList.add('light');
        b.classList.remove('dark');
    }
});
