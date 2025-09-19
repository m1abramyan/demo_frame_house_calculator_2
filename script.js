/**
 * Калькулятор каркасного дома
 * Выполняет расчёты параметров каркасного дома с различными типами крыш
 */
class HouseCalculator {
    constructor() {
        // DOM элементы
        this.form = document.getElementById('houseForm');
        this.slopesResults = document.getElementById('slopesResults');
        this.areasResults = document.getElementById('areasResults');
        
        // Константы
        this.constants = {
            SINGLE_SLOPE_COEFF: 0.3,
            DOUBLE_SLOPE_COEFF: 0.15,
            BASE_HEIGHT: 2.4,
            HEIGHT_REDUCTION_PERCENT: 30,
            OVERHANG_LENGTH: 0.3
        };
        
        // Предустановленные значения размеров
        this.sizeOptions = {
            single: {
                width: [3, 3.5, 4, 4.5, 5, 6],
                length: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            },
            double: {
                width: [3, 4, 5, 6, 7, 8, 9, 10],
                length: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            },
            multi: {
                width: [5, 6, 7, 8, 9, 10],
                length: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            }
        };
        
        // Флаг для отслеживания первого расчёта
        this.hasCalculated = false;
        
        this.init();
    }
    
    /**
     * Инициализация приложения
     */
    init() {
        this.bindEvents();
        // Устанавливаем односкатную крышу по умолчанию
        document.getElementById('houseType').value = 'single';
        this.updateSizeOptions('single');
    }
    
    /**
     * Привязка обработчиков событий
     */
    bindEvents() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculate();
        });
        
        // Обработчики для выбора типа дома
        const houseTypeOptions = document.querySelectorAll('.house-type-option');
        houseTypeOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Убираем выделение с других опций
                houseTypeOptions.forEach(opt => opt.classList.remove('selected'));
                // Выделяем выбранную опцию
                option.classList.add('selected');
                // Устанавливаем значение в скрытое поле
                const houseType = option.dataset.type;
                document.getElementById('houseType').value = houseType;
                // Обновляем опции размеров
                this.updateSizeOptions(houseType);
                // Сбрасываем все расчёты при изменении типа дома
                this.resetCalculations();
            });
        });
        
        // Обработчик для чекбокса свесов
        const roofOverhangCheckbox = document.getElementById('roofOverhang');
        roofOverhangCheckbox.addEventListener('change', () => {
            // Автоматически пересчитываем, если уже был выполнен расчёт
            if (this.hasCalculated) {
                this.calculate();
            }
        });
        
        // Плавная прокрутка к результатам на мобильных устройствах
        if (window.innerWidth <= 640) {
            this.form.addEventListener('submit', () => {
                setTimeout(() => {
                    this.resultsSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            });
        }
    }
    
    /**
     * Основной метод расчёта
     */
    calculate() {
        try {
            // Получение данных формы
            const formData = this.getFormData();
            
            // Валидация
            if (!this.validateInput(formData)) {
                return;
            }
            
            // Расчёт в зависимости от типа дома
            let result;
            switch (formData.houseType) {
                case 'single':
                    result = this.calculateSingleSlope(formData);
                    break;
                case 'double':
                    result = this.calculateDoubleSlope(formData);
                    break;
                case 'multi':
                    result = this.calculateMultiLevel(formData);
                    break;
                default:
                    throw new Error('Неизвестный тип дома');
            }
            
            // Отображение результатов
            this.displayResults(result);
            
            // Устанавливаем флаг первого расчёта
            this.hasCalculated = true;
            
        } catch (error) {
            console.error('Ошибка расчёта:', error);
            alert('Произошла ошибка при расчёте. Проверьте введённые данные.');
        }
    }
    
    /**
     * Сброс всех расчётов
     */
    resetCalculations() {
        // Показываем заглушки и очищаем результаты
        this.slopesResults.innerHTML = '<div class="placeholder"><p>Выберите параметры дома и нажмите "Рассчитать"</p></div>';
        this.areasResults.innerHTML = '<div class="placeholder"><p>Выберите параметры дома и нажмите "Рассчитать"</p></div>';
        
        // Сбрасываем флаг расчёта
        this.hasCalculated = false;
    }
    
    /**
     * Обновление опций размеров в зависимости от типа дома
     */
    updateSizeOptions(houseType) {
        const widthOptions = document.getElementById('widthOptions');
        const lengthOptions = document.getElementById('lengthOptions');
        
        // Очищаем текущие опции
        widthOptions.innerHTML = '';
        lengthOptions.innerHTML = '';
        
        // Добавляем новые опции
        if (this.sizeOptions[houseType]) {
            this.sizeOptions[houseType].width.forEach(size => {
                const option = document.createElement('div');
                option.className = 'size-option';
                option.dataset.value = size;
                option.innerHTML = `<div class="size-card">${size}</div>`;
                
                option.addEventListener('click', () => {
                    // Убираем выделение с других опций
                    widthOptions.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
                    // Выделяем выбранную опцию
                    option.classList.add('selected');
                    // Автоматически пересчитываем, если уже был выполнен расчёт
                    if (this.hasCalculated) {
                        this.calculate();
                    }
                });
                
                widthOptions.appendChild(option);
            });
            
            this.sizeOptions[houseType].length.forEach(size => {
                const option = document.createElement('div');
                option.className = 'size-option';
                option.dataset.value = size;
                option.innerHTML = `<div class="size-card">${size}</div>`;
                
                option.addEventListener('click', () => {
                    // Убираем выделение с других опций
                    lengthOptions.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
                    // Выделяем выбранную опцию
                    option.classList.add('selected');
                    // Автоматически пересчитываем, если уже был выполнен расчёт
                    if (this.hasCalculated) {
                        this.calculate();
                    }
                });
                
                lengthOptions.appendChild(option);
            });
        }
    }
    
    
    /**
     * Получение данных формы
     */
    getFormData() {
        // Получаем ширину
        const selectedWidth = document.querySelector('#widthOptions .size-option.selected');
        const width = selectedWidth ? parseFloat(selectedWidth.dataset.value) : null;
        
        // Получаем длину
        const selectedLength = document.querySelector('#lengthOptions .size-option.selected');
        const length = selectedLength ? parseFloat(selectedLength.dataset.value) : null;
        
        return {
            width: width,
            length: length,
            houseType: document.getElementById('houseType').value,
            roofOverhang: document.getElementById('roofOverhang').checked
        };
    }
    
    /**
     * Валидация ввода
     */
    validateInput(data) {
        if (!data.width || data.width < 1) {
            alert('Ширина жилой части должна быть не менее 1м');
            return false;
        }
        
        if (!data.length || data.length < 1) {
            alert('Длина жилой части должна быть не менее 1м');
            return false;
        }
        
        if (!data.houseType) {
            alert('Выберите тип дома');
            return false;
        }
        
        return true;
    }
    
    /**
     * Расчёт односкатной крыши
     */
    calculateSingleSlope(data) {
        const { width, length, roofOverhang } = data;
        const { SINGLE_SLOPE_COEFF, BASE_HEIGHT, HEIGHT_REDUCTION_PERCENT, OVERHANG_LENGTH } = this.constants;
        
        // Параметры ската
        const slopeWidth = width;
        const maxHeight = SINGLE_SLOPE_COEFF * width + BASE_HEIGHT;
        const minHeight = maxHeight - ((slopeWidth * HEIGHT_REDUCTION_PERCENT) / 100);
        const slopeLength = Math.sqrt(
            Math.pow(slopeWidth, 2) + Math.pow(maxHeight - minHeight, 2)
        );
        
        // Расчёт площадей
        const overhangLength = roofOverhang ? OVERHANG_LENGTH : 0;
        const effectiveLength = length + (overhangLength * 2);
        const topArea = slopeLength * effectiveLength;
        const topAreaWithoutOverhang = slopeLength * length;
        const sideArea = ((maxHeight - minHeight) * slopeWidth) / 2;
        
        // Площади стен
        const wall1 = maxHeight * length;
        const wall2 = minHeight * width + sideArea;
        const wall3 = minHeight * width + sideArea;
        const wall4 = minHeight * length;
        
        return {
            slopes: [{
                width: slopeWidth,
                maxHeight: maxHeight,
                minHeight: minHeight,
                length: slopeLength,
                topArea: topArea,
                topAreaWithoutOverhang: topAreaWithoutOverhang,
                sideArea: sideArea,
                overhangLength: overhangLength
            }],
            walls: {
                wall1: wall1,
                wall2: wall2,
                wall3: wall3,
                wall4: wall4,
                total: wall1 + wall2 + wall3 + wall4
            },
            totals: {
                walls: wall1 + wall2 + wall3 + wall4,
                roof: topArea,
                roofWithoutOverhang: topAreaWithoutOverhang,
                floor: width * length
            },
            roofOverhang: roofOverhang
        };
    }
    
    /**
     * Расчёт двухскатной крыши
     */
    calculateDoubleSlope(data) {
        const { width, length, roofOverhang } = data;
        const { DOUBLE_SLOPE_COEFF, BASE_HEIGHT, HEIGHT_REDUCTION_PERCENT, OVERHANG_LENGTH } = this.constants;
        
        // Параметры скатов
        const slopeWidth = width / 2;
        const maxHeight = DOUBLE_SLOPE_COEFF * width + BASE_HEIGHT;
        const minHeight = maxHeight - ((slopeWidth * HEIGHT_REDUCTION_PERCENT) / 100);
        const slopeLength = Math.sqrt(
            Math.pow(slopeWidth, 2) + Math.pow(maxHeight - minHeight, 2)
        );
        
        // Расчёт площадей
        const overhangLength = roofOverhang ? OVERHANG_LENGTH : 0;
        const effectiveLength = length + (overhangLength * 2);
        const topArea1 = slopeLength * effectiveLength;
        const topAreaWithoutOverhang1 = slopeLength * length;
        const sideArea1 = ((maxHeight - minHeight) * slopeWidth) / 2;
        
        const topArea2 = topArea1;
        const topAreaWithoutOverhang2 = topAreaWithoutOverhang1;
        const sideArea2 = sideArea1;
        
        // Площади стен
        const wall1 = minHeight * length;
        const wall2 = minHeight * width + sideArea1 + sideArea2;
        const wall3 = minHeight * width + sideArea1 + sideArea2;
        const wall4 = minHeight * length;
        
        return {
            slopes: [
                {
                    width: slopeWidth,
                    maxHeight: maxHeight,
                    minHeight: minHeight,
                    length: slopeLength,
                    topArea: topArea1,
                    topAreaWithoutOverhang: topAreaWithoutOverhang1,
                    sideArea: sideArea1,
                    overhangLength: overhangLength
                },
                {
                    width: slopeWidth,
                    maxHeight: maxHeight,
                    minHeight: minHeight,
                    length: slopeLength,
                    topArea: topArea2,
                    topAreaWithoutOverhang: topAreaWithoutOverhang2,
                    sideArea: sideArea2,
                    overhangLength: overhangLength
                }
            ],
            walls: {
                wall1: wall1,
                wall2: wall2,
                wall3: wall3,
                wall4: wall4,
                total: wall1 + wall2 + wall3 + wall4
            },
            totals: {
                walls: wall1 + wall2 + wall3 + wall4,
                roof: topArea1 + topArea2,
                roofWithoutOverhang: topAreaWithoutOverhang1 + topAreaWithoutOverhang2,
                floor: width * length
            },
            roofOverhang: roofOverhang
        };
    }
    
    /**
     * Расчёт разноуровневой крыши
     */
    calculateMultiLevel(data) {
        const { width, length, roofOverhang } = data;
        const { SINGLE_SLOPE_COEFF, BASE_HEIGHT, HEIGHT_REDUCTION_PERCENT, OVERHANG_LENGTH } = this.constants;
        
        // Расчёт ширины ската 1
        let slope1Width;
        if (width <= 7) {
            slope1Width = 3 + 0.5 * (width - 5);
        } else if (width === 8 || width === 9) {
            slope1Width = 5;
        } else if (width === 10) {
            slope1Width = 6;
        } else {
            slope1Width = 0.6 * width;
        }
        
        const slope2Width = width - slope1Width;
        
        // Параметры ската 1
        const maxHeight1 = (SINGLE_SLOPE_COEFF * slope1Width) + BASE_HEIGHT;
        const minHeight1 = maxHeight1 - ((slope1Width * HEIGHT_REDUCTION_PERCENT) / 100);
        const slopeLength1 = Math.sqrt(
            Math.pow(slope1Width, 2) + Math.pow(maxHeight1 - minHeight1, 2)
        );
        
        // Параметры ската 2
        const maxHeight2 = (SINGLE_SLOPE_COEFF * slope2Width) + BASE_HEIGHT;
        const minHeight2 = maxHeight2 - ((slope2Width * HEIGHT_REDUCTION_PERCENT) / 100);
        const slopeLength2 = Math.sqrt(
            Math.pow(slope2Width, 2) + Math.pow(maxHeight2 - minHeight2, 2)
        );
        
        // Расчёт площадей
        const overhangLength = roofOverhang ? OVERHANG_LENGTH : 0;
        const effectiveLength = length + (overhangLength * 2);
        
        const topArea1 = slopeLength1 * effectiveLength;
        const topAreaWithoutOverhang1 = slopeLength1 * length;
        const sideArea1 = ((maxHeight1 - minHeight1) * slope1Width) / 2;
        
        const topArea2 = slopeLength2 * effectiveLength;
        const topAreaWithoutOverhang2 = slopeLength2 * length;
        const sideArea2 = ((maxHeight2 - minHeight2) * slope2Width) / 2;
        
        // Площади стен
        const wall1 = minHeight1 * length;
        const wall2 = minHeight1 * width + sideArea1 + sideArea2;
        const wall3 = minHeight1 * width + sideArea1 + sideArea2;
        const wall4 = minHeight1 * length;
        
        return {
            slopes: [
                {
                    width: slope1Width,
                    maxHeight: maxHeight1,
                    minHeight: minHeight1,
                    length: slopeLength1,
                    topArea: topArea1,
                    topAreaWithoutOverhang: topAreaWithoutOverhang1,
                    sideArea: sideArea1,
                    overhangLength: overhangLength
                },
                {
                    width: slope2Width,
                    maxHeight: maxHeight2,
                    minHeight: minHeight2,
                    length: slopeLength2,
                    topArea: topArea2,
                    topAreaWithoutOverhang: topAreaWithoutOverhang2,
                    sideArea: sideArea2,
                    overhangLength: overhangLength
                }
            ],
            walls: {
                wall1: wall1,
                wall2: wall2,
                wall3: wall3,
                wall4: wall4,
                total: wall1 + wall2 + wall3 + wall4
            },
            totals: {
                walls: wall1 + wall2 + wall3 + wall4,
                roof: topArea1 + topArea2,
                roofWithoutOverhang: topAreaWithoutOverhang1 + topAreaWithoutOverhang2,
                floor: width * length
            },
            roofOverhang: roofOverhang
        };
    }
    
    /**
     * Отображение результатов
     */
    displayResults(result) {
        // Отображение параметров скатов
        this.displayRoofParams(result.slopes);
        
        // Отображение объединённой таблицы площадей и расчётов
        this.displayCombinedAreas(result.walls, result.totals, result.roofOverhang);
    }
    
    /**
     * Отображение параметров скатов
     */
    displayRoofParams(slopes) {
        const slopesHtml = `
            <div class="slopes-table ${slopes.length === 1 ? 'single-slope' : ''}">
                    <div class="slopes-header">
                        <div class="slopes-cell">Параметр</div>
                        <div class="slopes-cell">${slopes.length > 1 ? 'Скат 1' : 'Скат'}</div>
                        ${slopes.length > 1 ? '<div class="slopes-cell">Скат 2</div>' : ''}
                    </div>
                    <div class="slopes-row">
                        <div class="slopes-cell"><strong>Ширина ската:</strong></div>
                        <div class="slopes-cell">${slopes[0].width.toFixed(2)} м</div>
                        ${slopes.length > 1 ? `<div class="slopes-cell">${slopes[1].width.toFixed(2)} м</div>` : ''}
                    </div>
                    <div class="slopes-row">
                        <div class="slopes-cell"><strong>Максимальная высота:</strong></div>
                        <div class="slopes-cell">${slopes[0].maxHeight.toFixed(2)} м</div>
                        ${slopes.length > 1 ? `<div class="slopes-cell">${slopes[1].maxHeight.toFixed(2)} м</div>` : ''}
                    </div>
                    <div class="slopes-row">
                        <div class="slopes-cell"><strong>Минимальная высота:</strong></div>
                        <div class="slopes-cell">${slopes[0].minHeight.toFixed(2)} м</div>
                        ${slopes.length > 1 ? `<div class="slopes-cell">${slopes[1].minHeight.toFixed(2)} м</div>` : ''}
                    </div>
                    <div class="slopes-row">
                        <div class="slopes-cell"><strong>Длина ската:</strong></div>
                        <div class="slopes-cell">${slopes[0].length.toFixed(2)} м</div>
                        ${slopes.length > 1 ? `<div class="slopes-cell">${slopes[1].length.toFixed(2)} м</div>` : ''}
                    </div>
                    <div class="slopes-row">
                        <div class="slopes-cell"><strong>Верхняя площадь ${slopes[0].overhangLength > 0 ? '(с свесами)' : '(без свесов)'}:</strong></div>
                        <div class="slopes-cell">${slopes[0].topArea.toFixed(2)} м²</div>
                        ${slopes.length > 1 ? `<div class="slopes-cell">${slopes[1].topArea.toFixed(2)} м²</div>` : ''}
                    </div>
                    ${slopes[0].overhangLength > 0 ? `
                    <div class="slopes-row">
                        <div class="slopes-cell"><strong>Верхняя площадь (без свесов):</strong></div>
                        <div class="slopes-cell">${slopes[0].topAreaWithoutOverhang.toFixed(2)} м²</div>
                        ${slopes.length > 1 ? `<div class="slopes-cell">${slopes[1].topAreaWithoutOverhang.toFixed(2)} м²</div>` : ''}
                    </div>
                    ` : ''}
                    <div class="slopes-row">
                        <div class="slopes-cell"><strong>Боковая площадь:</strong></div>
                        <div class="slopes-cell">${slopes[0].sideArea.toFixed(2)} м²</div>
                        ${slopes.length > 1 ? `<div class="slopes-cell">${slopes[1].sideArea.toFixed(2)} м²</div>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        this.slopesResults.innerHTML = slopesHtml;
    }
    
    /**
     * Отображение объединённой таблицы площадей и расчётов
     */
    displayCombinedAreas(walls, totals, roofOverhang) {
        const areasHtml = `
            <div class="slopes-table areas-table">
                <div class="slopes-header">
                    <div class="slopes-cell">Параметр</div>
                    <div class="slopes-cell">Значение</div>
                </div>
                <div class="slopes-row">
                    <div class="slopes-cell"><strong>Стена 1:</strong></div>
                    <div class="slopes-cell">${walls.wall1.toFixed(2)} м²</div>
                </div>
                <div class="slopes-row">
                    <div class="slopes-cell"><strong>Стена 2:</strong></div>
                    <div class="slopes-cell">${walls.wall2.toFixed(2)} м²</div>
                </div>
                <div class="slopes-row">
                    <div class="slopes-cell"><strong>Стена 3:</strong></div>
                    <div class="slopes-cell">${walls.wall3.toFixed(2)} м²</div>
                </div>
                <div class="slopes-row">
                    <div class="slopes-cell"><strong>Стена 4:</strong></div>
                    <div class="slopes-cell">${walls.wall4.toFixed(2)} м²</div>
                </div>
                <div class="slopes-row">
                    <div class="slopes-cell"><strong>Общая площадь стен:</strong></div>
                    <div class="slopes-cell">${totals.walls.toFixed(2)} м²</div>
                </div>
                <div class="slopes-row">
                    <div class="slopes-cell"><strong>Площадь крыши ${roofOverhang ? '(с свесами)' : '(без свесов)'}:</strong></div>
                    <div class="slopes-cell">${totals.roof.toFixed(2)} м²</div>
                </div>
                ${roofOverhang ? `
                <div class="slopes-row">
                    <div class="slopes-cell"><strong>Площадь крыши (без свесов):</strong></div>
                    <div class="slopes-cell">${totals.roofWithoutOverhang.toFixed(2)} м²</div>
                </div>
                ` : ''}
                <div class="slopes-row">
                    <div class="slopes-cell"><strong>Площадь пола:</strong></div>
                    <div class="slopes-cell">${totals.floor.toFixed(2)} м²</div>
                </div>
            </div>
        `;
        
        this.areasResults.innerHTML = areasHtml;
    }
    
    /**
     * Отображение площадей стен
     */
    displayWallAreas(walls) {
        const wallsHtml = `
            <div class="result-group">
                <h3>Площади стен</h3>
                <div class="walls-grid">
                    <div class="wall-card">
                        <div class="wall-number">1</div>
                        <div class="wall-info">
                            <div class="wall-label">Стена 1</div>
                            <div class="wall-value">${walls.wall1.toFixed(2)} м²</div>
                        </div>
                    </div>
                    <div class="wall-card">
                        <div class="wall-number">2</div>
                        <div class="wall-info">
                            <div class="wall-label">Стена 2</div>
                            <div class="wall-value">${walls.wall2.toFixed(2)} м²</div>
                        </div>
                    </div>
                    <div class="wall-card">
                        <div class="wall-number">3</div>
                        <div class="wall-info">
                            <div class="wall-label">Стена 3</div>
                            <div class="wall-value">${walls.wall3.toFixed(2)} м²</div>
                        </div>
                    </div>
                    <div class="wall-card">
                        <div class="wall-number">4</div>
                        <div class="wall-info">
                            <div class="wall-label">Стена 4</div>
                            <div class="wall-value">${walls.wall4.toFixed(2)} м²</div>
                        </div>
                    </div>
                </div>
                <div class="walls-total">
                    <div class="total-icon">📐</div>
                    <div class="total-info">
                        <div class="total-label">Общая площадь стен</div>
                        <div class="total-value">${walls.total.toFixed(2)} м²</div>
                    </div>
                </div>
            </div>
        `;
        
        this.results.innerHTML += wallsHtml;
    }
    
    /**
     * Отображение общих расчётов
     */
    displayTotalAreas(totals, roofOverhang) {
        const totalsHtml = `
            <div class="result-group">
                <h3>Общие расчёты</h3>
                <div class="totals-table">
                    <div class="totals-header">
                        <div class="totals-cell">Параметр</div>
                        <div class="totals-cell">Значение</div>
                    </div>
                    <div class="totals-row">
                        <div class="totals-cell">
                            <strong>Общая площадь стен</strong>
                        </div>
                        <div class="totals-cell">${totals.walls.toFixed(2)} м²</div>
                    </div>
                    <div class="totals-row">
                        <div class="totals-cell">
                            <strong>Площадь крыши ${roofOverhang ? '(с свесами)' : '(без свесов)'}</strong>
                        </div>
                        <div class="totals-cell">${totals.roof.toFixed(2)} м²</div>
                    </div>
                    ${roofOverhang ? `
                    <div class="totals-row">
                        <div class="totals-cell">
                            <strong>Площадь крыши (без свесов)</strong>
                        </div>
                        <div class="totals-cell">${totals.roofWithoutOverhang.toFixed(2)} м²</div>
                    </div>
                    ` : ''}
                    <div class="totals-row">
                        <div class="totals-cell">
                            <strong>Площадь пола</strong>
                        </div>
                        <div class="totals-cell">${totals.floor.toFixed(2)} м²</div>
                    </div>
                </div>
            </div>
        `;
        
        this.results.innerHTML += totalsHtml;
    }
}

// Инициализация приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    new HouseCalculator();
});
