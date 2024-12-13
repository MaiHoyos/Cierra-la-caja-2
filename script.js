document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('playButton');
    const instructionsSection = document.getElementById('instructionsSection');
    const gameSection = document.getElementById('gameSection');
    const numbers = document.querySelectorAll('.number');
    const die1 = document.getElementById('die1');
    const die2 = document.getElementById('die2');
    const rollButton = document.getElementById('rollButton');
    const resetButton = document.getElementById('resetButton');
    const modal = document.getElementById('sumModal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const acceptBtn = document.getElementById('acceptSum');
    const cancelBtn = document.getElementById('cancelSum');
    const sumInput = document.getElementById('sumInput');
    const diceSumText = document.getElementById('diceSum');
    const gameOverModal = document.getElementById('gameOverModal');
    const finalDiceResult = document.getElementById('finalDiceResult');

    let currentSum = 0;
    let selectedSum = 0;
    let canRoll = true;
    let lastRoll = { die1: 1, die2: 1 };

    playButton.addEventListener('click', () => {
        instructionsSection.style.display = 'none';
        gameSection.style.display = 'block';
        die2.style.display = 'none';
    });

    numbers.forEach(number => {
        number.addEventListener('click', () => {
            if (!number.classList.contains('closed') && !canRoll) {
                const value = parseInt(number.dataset.value);
                if (number.classList.contains('selected')) {
                    number.classList.remove('selected');
                    selectedSum -= value;
                } else {
                    if (selectedSum + value > currentSum) {
                        alert(`¡Cuidado! La suma de las casillas seleccionadas no puede exceder ${currentSum}.`);
                    } else {
                        number.classList.add('selected');
                        selectedSum += value;
                    }
                }
                if (selectedSum === currentSum) {
                    closeSelectedNumbers();
                }
            }
        });
    });

    function getRandomDieValue() {
        return Math.floor(Math.random() * 6) + 1;
    }

    function updateDieImage(dieElement, value) {
        dieElement.src = `dado${value}.PNG`;
        dieElement.alt = `Dado mostrando ${value}`;
    }

    function animateDice(callback) {
        const animationDuration = 1000;
        const intervalDuration = 50;
        let elapsedTime = 0;

        die1.classList.add('shake');
        die2.classList.add('shake');

        const intervalId = setInterval(() => {
            updateDieImage(die1, getRandomDieValue());
            updateDieImage(die2, getRandomDieValue());

            elapsedTime += intervalDuration;

            if (elapsedTime >= animationDuration) {
                clearInterval(intervalId);
                die1.classList.remove('shake');
                die2.classList.remove('shake');
                callback();
            }
        }, intervalDuration);
    }

    function showSumModal(dice1Value, dice2Value) {
        const visibleDiceValue = dice1Value;
        const hiddenDiceValue = dice2Value;
        const totalSum = visibleDiceValue + hiddenDiceValue;
        diceSumText.textContent = `${visibleDiceValue} + ? = ${totalSum}`;
        sumInput.value = '';
        modal.style.display = 'block';
    }

    function hideSumModal() {
        modal.style.display = 'none';
    }

    function showCorrectGif() {
        const gifElement = document.getElementById('correctGif');
        gifElement.style.display = 'block';
        setTimeout(() => {
            gifElement.style.display = 'none';
        }, 1000);
    }

    function showIncorrectGif() {
        const gifElement = document.getElementById('incorrectGif');
        gifElement.style.display = 'block';
        setTimeout(() => {
            gifElement.style.display = 'none';
            showSumModal(lastRoll.die1, lastRoll.die2);
        }, 1000);
    }

    function showGameOverModal() {
        finalDiceResult.textContent = `Último lanzamiento: ${lastRoll.die1} y ${lastRoll.die2}`;
        gameOverModal.style.display = 'block';
    }

    closeBtn.onclick = () => {
        if (confirm('¿Estás seguro de que quieres cerrar? Aún no has ingresado la suma correcta.')) {
            hideSumModal();
        }
    };

    cancelBtn.onclick = () => {
        if (confirm('¿Estás seguro de que quieres cancelar? Aún no has ingresado la suma correcta.')) {
            hideSumModal();
        }
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            if (confirm('¿Estás seguro de que quieres cerrar? Aún no has ingresado la suma correcta.')) {
                hideSumModal();
            }
        }
    }

    function checkPossibleSum(targetSum, availableNumbers) {
        const numbers = Array.from(availableNumbers)
            .filter(num => !num.classList.contains('closed'))
            .map(num => parseInt(num.dataset.value));

        // Verificar si hay números disponibles
        if (numbers.length === 0) {
            return false;
        }

        // Verificar si la suma objetivo es posible con los números disponibles
        return findCombination(numbers, targetSum, Math.min(4, numbers.length));
    }

    function findCombination(numbers, target, maxCount) {
        if (target === 0) return true;
        if (maxCount === 0 || numbers.length === 0) return false;

        // Intentar usar el primer número
        if (numbers[0] <= target && findCombination(numbers.slice(1), target - numbers[0], maxCount - 1)) {
            return true;
        }

        // Intentar sin usar el primer número
        return findCombination(numbers.slice(1), target, maxCount);
    }

    function closeSelectedNumbers() {
        numbers.forEach(number => {
            if (number.classList.contains('selected')) {
                number.classList.remove('selected');
                number.classList.add('closed');
            }
        });
        selectedSum = 0;
        canRoll = true;
        rollButton.disabled = false;

        // Verificar si quedan números disponibles
        const availableNumbers = Array.from(numbers).filter(num => !num.classList.contains('closed'));
        if (availableNumbers.length === 0) {
            showGameOverModal();
        } else if (!checkPossibleSum(currentSum, numbers)) {
            showGameOverModal();
        }
    }

    acceptBtn.onclick = function() {
        const userGuess = parseInt(sumInput.value);
        const hiddenDiceValue = lastRoll.die2;
        
        if (userGuess === hiddenDiceValue) {
            hideSumModal();
            showCorrectGif();
            currentSum = lastRoll.die1 + hiddenDiceValue;
            selectedSum = 0;
            canRoll = false;
            rollButton.disabled = true;

            if (!checkPossibleSum(currentSum, numbers)) {
                showGameOverModal();
            } else {
                // El juego continúa, habilitar la selección de números
                numbers.forEach(number => {
                    if (!number.classList.contains('closed')) {
                        number.style.pointerEvents = 'auto';
                    }
                });
            }
        } else {
            hideSumModal();
            showIncorrectGif();
        }
    }

    function rollDice() {
        if (canRoll) {
            rollButton.disabled = true;
            resetButton.disabled = true;

            animateDice(() => {
                lastRoll.die1 = getRandomDieValue();
                lastRoll.die2 = getRandomDieValue();
                updateDieImage(die1, lastRoll.die1);
                updateDieImage(die2, lastRoll.die2);
                die2.style.display = 'none';
                resetButton.disabled = false;
                
                setTimeout(() => {
                    showSumModal(lastRoll.die1, lastRoll.die2);
                }, 1000);
            });
        }
    }

    function resetGame() {
        numbers.forEach(number => {
            number.classList.remove('selected', 'closed');
        });
        updateDieImage(die1, 1);
        updateDieImage(die2, 1);
        die2.style.display = 'none';
        lastRoll = { die1: 1, die2: 1 };
        currentSum = 0;
        selectedSum = 0;
        canRoll = true;
        rollButton.disabled = false;
        gameOverModal.style.display = 'none';
    }

    rollButton.addEventListener('click', rollDice);
    resetButton.addEventListener('click', resetGame);
    document.getElementById('gameOverReset').addEventListener('click', resetGame);
});

