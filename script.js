const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwfWq0zDG8GCMtcsEoxl_P8mXFt_PDmqVGJ-cXSHyboiXDgGY8xTZwb9Kq4nkLvQKxyyQ/exec';

document.addEventListener('DOMContentLoaded', () => {
    // Referências de elementos
    const btnNo = document.getElementById('btn-no');
    const btnYes = document.getElementById('btn-yes');
    const btnContinue = document.getElementById('btn-continue');
    const dateForm = document.getElementById('date-form');
    
    // Telas
    const screen1 = document.getElementById('screen-1');
    const screen2 = document.getElementById('screen-2');
    const screen3 = document.getElementById('screen-3');
    const screen4 = document.getElementById('screen-4');

    // Gerar horários (intervalos de 30 minutos)
    const timeInput = document.getElementById('time-input');
    for (let h = 8; h <= 23; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hour = h.toString().padStart(2, '0');
            const minute = m.toString().padStart(2, '0');
            const timeString = `${hour}:${minute}`;
            const option = document.createElement('option');
            option.value = timeString;
            option.textContent = timeString;
            timeInput.appendChild(option);
        }
    }

    // Definir data mínima do input para o dia de hoje
    const dateInput = document.getElementById('date-input');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // Truque para permitir digitar a partir do "dia" E abrir a seleção:
    dateInput.type = 'text';
    dateInput.placeholder = 'DD/MM/AAAA';
    
    dateInput.addEventListener('focus', () => {
        if (dateInput.type === 'text') {
            dateInput.type = 'date';
            dateInput.setAttribute('min', today); // Re-aplica após virar data
        }
    });

    dateInput.addEventListener('click', () => {
        try {
            dateInput.showPicker(); // Abre o calendário nativo
        } catch (err) {}
    });
    
    dateInput.addEventListener('blur', () => {
        if (!dateInput.value) {
            dateInput.type = 'text';
        }
    });

    // Função para transição de telas
    function switchScreen(from, to) {
        from.classList.remove('active');
        setTimeout(() => {
            to.classList.add('active');
        }, 500);
    }

    // Ação do Botão SIM
    btnYes.addEventListener('click', () => {
        switchScreen(screen1, screen2);
        createFloatingHearts();
        // Esconde o botão não caso ele tenha sido movido para o body
        btnNo.style.display = 'none';
    });

    // Ação do Botão Continuar
    btnContinue.addEventListener('click', () => {
        switchScreen(screen2, screen3);
    });

    // Lógica do Botão NÃO fugir
    const moveBtnNo = () => {
        // Move o botão para o body para evitar que o "transform" do container altere o referencial do fixed
        if (btnNo.parentNode !== document.body) {
            document.body.appendChild(btnNo);
        }

        const btnWidth = btnNo.offsetWidth;
        const btnHeight = btnNo.offsetHeight;
        
        // Pega as dimensões reais visíveis da tela
        const maxX = window.innerWidth - btnWidth - 40;
        const maxY = window.innerHeight - btnHeight - 40;

        const randomX = Math.max(20, Math.floor(Math.random() * maxX));
        const randomY = Math.max(20, Math.floor(Math.random() * maxY));

        btnNo.style.position = 'fixed';
        btnNo.style.left = `${randomX}px`;
        btnNo.style.top = `${randomY}px`;
    };

    // Foge no mouseover (Desktop) e no touchstart (Mobile)
    btnNo.addEventListener('mouseover', moveBtnNo);
    btnNo.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Evita que o clique seja processado antes do botão fugir
        moveBtnNo();
    });

    // Ação do Formulário de Data e Horário
    dateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const dateVal = dateInput.value;
        const timeVal = timeInput.value;
        
        if (!dateVal || !timeVal) return;

        const btnConfirm = document.getElementById('btn-confirm');
        const btnText = btnConfirm.querySelector('.btn-text');
        const spinner = btnConfirm.querySelector('.loading-spinner');

        // Estado de Loading no botão
        btnConfirm.disabled = true;
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');

        // Coletar dados complementares
        const sendDate = new Date().toLocaleString('pt-BR');
        const browser = navigator.userAgent;
        const isMobile = /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';

        // Formatar a data selecionada para padrão Brasileiro
        const [year, month, day] = dateVal.split('-');
        const formattedDate = `${day}/${month}/${year}`;

        // Objeto JSON para enviar
        const dataToSend = {
            dataEscolhida: formattedDate,
            horarioEscolhido: timeVal,
            dataEnvio: sendDate,
            navegador: browser,
            dispositivo: isMobile
        };

        try {
            if (GOOGLE_SCRIPT_URL === 'COLE_SUA_URL_AQUI') {
                console.warn("A URL do Google Script não foi inserida! Simulando um delay.");
                await new Promise(r => setTimeout(r, 1500)); 
            } else {
                // Envia como text/plain para evitar erro de CORS (preflight OPTIONS) no Google Apps Script
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    },
                    body: JSON.stringify(dataToSend)
                });
            }

            // Exibe os dados de sucesso
            document.getElementById('display-date').textContent = formattedDate;
            document.getElementById('display-time').textContent = timeVal;
            
            switchScreen(screen3, screen4);
            createConfetti();

        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Tivemos um problema para salvar, mas o date tá de pé! ❤️');
            
            // Avança para o sucesso mesmo com erro para não estragar a experiência
            document.getElementById('display-date').textContent = formattedDate;
            document.getElementById('display-time').textContent = timeVal;
            switchScreen(screen3, screen4);
            createConfetti();
        } finally {
            // Restaura o botão original (mesmo que escondido)
            btnConfirm.disabled = false;
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    });

    // Animação de corações subindo (Tela 2)
    function createFloatingHearts() {
        const container = document.getElementById('hearts-container');
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.classList.add('heart');
                heart.innerHTML = '❤️';
                heart.style.left = Math.random() * 100 + 'vw';
                heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
                heart.style.animationDuration = (Math.random() * 3 + 2) + 's';
                container.appendChild(heart);
                
                setTimeout(() => heart.remove(), 5000);
            }, i * 300);
        }
    }

    // Animação de confetes caindo (Tela 4)
    function createConfetti() {
        const container = document.getElementById('hearts-container');
        for (let i = 0; i < 50; i++) {
            const confeti = document.createElement('div');
            confeti.classList.add('heart');
            const colors = ['❤️', '💖', '✨', '🎉', '🥰'];
            confeti.innerHTML = colors[Math.floor(Math.random() * colors.length)];
            confeti.style.left = Math.random() * 100 + 'vw';
            confeti.style.top = '-20px';
            confeti.style.fontSize = (Math.random() * 25 + 15) + 'px';
            
            const duration = Math.random() * 2 + 2;
            confeti.animate([
                { transform: `translate3d(0,0,0) rotate(0deg)` },
                { transform: `translate3d(${Math.random()*100 - 50}px, 100vh, 0) rotate(${Math.random()*360}deg)` }
            ], {
                duration: duration * 1000,
                easing: 'cubic-bezier(.37,0,.63,1)',
                fill: 'forwards'
            });

            container.appendChild(confeti);
            setTimeout(() => confeti.remove(), duration * 1000);
        }
    }
});
