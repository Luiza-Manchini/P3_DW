// Elementos principais
const btnVerificar = document.getElementById('btn-verificar');
const form = document.getElementById('quiz-form');
const questions = document.querySelectorAll('.question-item');

// Seção de resultado
const resultSection = document.getElementById('result-section');
const resultAlert = document.getElementById('result-alert');
const resultBarFill = document.getElementById('result-bar-fill');
const currentQuestionEl = document.getElementById('current-question');
const progressBar = document.getElementById('quiz-progress');

// Configuração de pontuação
const totalQuestions = 5;
const pointsPerQuestion = 2; // 2 pontos por acerto
const totalPoints = totalQuestions * pointsPerQuestion; // 10 pontos

const iconSources = {
    correct:
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23198754"><path d="M9 16.17 4.83 12 3.41 13.41 9 19l12-12-1.41-1.41z"/></svg>',
    incorrect:
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23dc3545"><path d="M18.3 5.71 13.01 11l5.29 5.29-1.42 1.42L11.59 12.4l-5.3 5.31-1.4-1.42 5.29-5.3-5.29-5.29 1.41-1.42 5.3 5.3 5.29-5.3z"/></svg>'
};

function setStatusIcon(label, type) {
    let icon = label.querySelector('.status-icon-img');

    if (!icon) {
        icon = document.createElement('img');
        icon.className = 'status-icon-img';
        icon.width = 18;
        icon.height = 18;
        icon.decoding = 'async';
        label.prepend(icon);
    }

    if (type === 'correct') {
        icon.src = iconSources.correct;
        icon.alt = 'Ícone verde indicando alternativa correta';
    } else if (type === 'incorrect') {
        icon.src = iconSources.incorrect;
        icon.alt = 'Ícone vermelho indicando alternativa incorreta';
    } else {
        icon.removeAttribute('src');
        icon.alt = '';
    }
}

// Controle da pergunta atual
let currentQuestion = 1;

function updateProgress(index) {
    const percent = Math.max(0, Math.min(100, (index / totalQuestions) * 100));
    progressBar.style.width = percent + '%';
    progressBar.setAttribute('aria-valuenow', percent.toFixed(0));
}

// Mostra apenas a pergunta indicada 
function showQuestion(index) {
    questions.forEach((q, i) => {
        q.style.display = i === index - 1 ? 'block' : 'none';
    });

    currentQuestionEl.textContent = index;
    updateProgress(index);
}

// Inicia mostrando a pergunta 1
showQuestion(currentQuestion);

// Clique no botão: avança ou mostra resultado
btnVerificar.addEventListener('click', function () {
    const questionName = 'q' + currentQuestion;
    const selected = form.querySelector(`input[name="${questionName}"]:checked`);

    // Garante que o usuário marcou algo
    if (!selected) {
        alert('Por favor, selecione uma alternativa antes de continuar.');
        return;
    }

    if (currentQuestion < totalQuestions) {
        currentQuestion++;
        showQuestion(currentQuestion);

        if (currentQuestion === totalQuestions) {
            btnVerificar.textContent = 'Ver resultado';
        }
    } else {
        calcularResultado();
    }
});

function calcularResultado() {
    let correctCount = 0;

    // Limpa classes e ícones anteriores
    const optionLabels = form.querySelectorAll('.option-label');
    optionLabels.forEach(label => {
        label.classList.remove('correct', 'incorrect');
        setStatusIcon(label, null);
    });

    // Percorre todas as questões
    for (let i = 1; i <= totalQuestions; i++) {
        const questionName = 'q' + i;
        const selected = form.querySelector(`input[name="${questionName}"]:checked`);
        const inputs = form.querySelectorAll(`input[name="${questionName}"]`);

        inputs.forEach(input => {
            const label = form.querySelector(`label[for="${input.id}"]`);
            if (!label) return;

            // Marca a alternativa correta em verde
            if (input.dataset.correct === 'true') {
                label.classList.add('correct');
                setStatusIcon(label, 'correct');
            }

            // Se essa foi a marcada e não é correta -> vermelho
            if (selected && selected.id === input.id && !input.dataset.correct) {
                label.classList.add('incorrect');
                setStatusIcon(label, 'incorrect');
            }
        });

        if (selected && selected.dataset.correct === 'true') {
            correctCount++;
        }
    }

    // Calcula pontuação
    const scorePoints = correctCount * pointsPerQuestion;
    const percentage = (scorePoints / totalPoints) * 100;

    // Mensagem de feedback
    let mensagem = '';

    if (scorePoints === totalPoints) {
        mensagem = 'Parabéns, você gabaritou o quiz!';
    } else if (scorePoints >= 6) {
        mensagem = 'Bom trabalho! Continue praticando programação.';
    } else {
        mensagem = 'Tudo bem errar! Reveja os conceitos e tente novamente.';
    }

    // Texto do resultado em alerta do Bootstrap
    const isAltaPontuacao = scorePoints >= 6;
    const alertClass = isAltaPontuacao ? 'alert-success' : 'alert-warning';
    resultAlert.className = `alert mb-3 ${alertClass}`;
    resultAlert.textContent =
        `Você fez ${scorePoints} de ${totalPoints} pontos (${correctCount} acerto(s) de ${totalQuestions}). ` +
        mensagem;

    // Mostra seção de resultado com animação
    resultSection.classList.add('show');

    // Anima a barrinha de nota
    requestAnimationFrame(() => {
        resultBarFill.style.width = percentage + '%';
        resultBarFill.setAttribute('aria-valuenow', percentage.toFixed(0));
    });

    // Mostra todas as perguntas para revisão
    questions.forEach(q => (q.style.display = 'block'));

    // Desabilita todos os radios e o botão
    const radios = form.querySelectorAll('input[type="radio"]');
    radios.forEach(r => (r.disabled = true));

    btnVerificar.disabled = true;
    btnVerificar.textContent = 'Finalizado';

    currentQuestionEl.textContent = totalQuestions;
    updateProgress(totalQuestions);
}
