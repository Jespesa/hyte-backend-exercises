// Tilastosivu
import { getEntries } from './api.js';
import { checkAuth, showToast, formatDate } from './main.js';

// Varmistetaan, että käyttäjä on kirjautunut
if (!checkAuth()) {
    // Jos ei kirjautunut, main.js ohjaa kirjautumissivulle
    throw new Error('Ei kirjautunut sisään');
}

// Globaalit muuttujat
let allEntries = [];
let moodChart = null;
let sleepChart = null;
let weightChart = null;
let monthlySummaryChart = null;

// DOM-elementit - mobiilivalikko
const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
const mobileNavClose = document.getElementById('mobile-nav-close');
const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');
const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

// DOM-elementit - tilastojen suodattimet
const moodPeriod = document.getElementById('mood-period');
const sleepPeriod = document.getElementById('sleep-period');
const weightPeriod = document.getElementById('weight-period');
const monthSelector = document.getElementById('month-selector');

// DOM-elementit - tilastojen yhteenvedot
const moodAvg = document.getElementById('mood-avg');
const moodMax = document.getElementById('mood-max');
const moodMin = document.getElementById('mood-min');
const moodTrend = document.getElementById('mood-trend');

const sleepAvg = document.getElementById('sleep-avg');
const sleepMax = document.getElementById('sleep-max');
const sleepMin = document.getElementById('sleep-min');
const sleepOptimal = document.getElementById('sleep-optimal');

const weightCurrent = document.getElementById('weight-current');
const weightAvg = document.getElementById('weight-avg');
const weightChange = document.getElementById('weight-change');
const weightVariation = document.getElementById('weight-variation');

const monthlyEntryCount = document.getElementById('monthly-entry-count');
const monthlyMoodAvg = document.getElementById('monthly-mood-avg');
const monthlySleepAvg = document.getElementById('monthly-sleep-avg');
const monthlyActivity = document.getElementById('monthly-activity');

// Hae kaikki merkinnät
async function fetchAllEntries() {
    try {
        const entries = await getEntries();
        allEntries = entries;
        
        // Järjestä merkinnät päivämäärän mukaan
        allEntries.sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date));
        
        // Alusta kuukausivalitsin
        initializeMonthSelector();
        
        // Päivitä tilastot
        updateAllCharts();
        
        return entries;
    } catch (error) {
        console.error('Virhe merkintöjen hakemisessa:', error);
        showToast('Merkintöjen hakeminen epäonnistui', 'error');
    }
}

// Alusta kuukausivalitsin
function initializeMonthSelector() {
    if (!monthSelector) return;
    
    // Kerää kaikki eri kuukaudet merkinnöistä
    const months = new Set();
    
    allEntries.forEach(entry => {
        const date = new Date(entry.entry_date);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        months.add(monthYear);
    });
    
    // Järjestä kuukaudet kronologisesti
    const sortedMonths = Array.from(months).sort();
    
    // Lisää valinnat kuukausivalitsimeen
    monthSelector.innerHTML = sortedMonths.map(monthYear => {
        const [year, month] = monthYear.split('-');
        const date = new Date(year, month - 1, 1);
        const monthName = date.toLocaleDateString('fi-FI', { month: 'long', year: 'numeric' });
        return `<option value="${monthYear}">${monthName}</option>`;
    }).join('');
    
    // Valitse oletuksena viimeisin kuukausi
    if (sortedMonths.length > 0) {
        monthSelector.value = sortedMonths[sortedMonths.length - 1];
    }
}

// Päivitä kaikki kaaviot
function updateAllCharts() {
    updateMoodChart();
    updateSleepChart();
    updateWeightChart();
    updateMonthlySummaryChart();
}

// Päivitä mielialakaavio
function updateMoodChart() {
    const period = moodPeriod ? moodPeriod.value : 'month';
    const filteredEntries = filterEntriesByPeriod(period);
    
    // Hae vain merkinnät, joissa on mieliala-arvo
    const moodEntries = filteredEntries.filter(entry => entry.mood != null);
    
    if (moodEntries.length === 0) {
        displayNoDataMessage('mood-chart');
        updateMoodStats([], period);
        return;
    }
    
    // Valmistele data kaaviota varten
    const chartData = moodEntries.map(entry => ({
        date: new Date(entry.entry_date),
        value: parseFloat(entry.mood)
    }));
    
    // Renderöi kaavio canvas-elementtiin
    renderLineChart('mood-chart', chartData, 'Mieliala', 'mood-line');
    
    // Päivitä tilastot
    updateMoodStats(chartData, period);
}

// Päivitä mielialatilastot
function updateMoodStats(chartData, period) {
    if (!moodAvg || !moodMax || !moodMin || !moodTrend) return;
    
    if (chartData.length === 0) {
        moodAvg.textContent = '-';
        moodMax.textContent = '-';
        moodMin.textContent = '-';
        moodTrend.textContent = '-';
        return;
    }
    
    // Laske keskiarvo
    const sum = chartData.reduce((total, item) => total + item.value, 0);
    const average = sum / chartData.length;
    moodAvg.textContent = average.toFixed(1);
    
    // Etsi maksimi ja minimi
    const max = Math.max(...chartData.map(item => item.value));
    const min = Math.min(...chartData.map(item => item.value));
    moodMax.textContent = max.toFixed(1);
    moodMin.textContent = min.toFixed(1);
    
    // Laske trendi
    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((total, item) => total + item.value, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((total, item) => total + item.value, 0) / secondHalf.length;
    
    const trend = secondHalfAvg - firstHalfAvg;
    
    if (trend > 0.5) {
        moodTrend.textContent = '↗️ Nouseva';
        moodTrend.style.color = 'var(--secondary-color)';
    } else if (trend < -0.5) {
        moodTrend.textContent = '↘️ Laskeva';
        moodTrend.style.color = 'var(--danger-color)';
    } else {
        moodTrend.textContent = '→ Vakaa';
        moodTrend.style.color = 'var(--text-color)';
    }
}

// Päivitä unikaavio
function updateSleepChart() {
    const period = sleepPeriod ? sleepPeriod.value : 'month';
    const filteredEntries = filterEntriesByPeriod(period);
    
    // Hae vain merkinnät, joissa on uni-arvo
    const sleepEntries = filteredEntries.filter(entry => entry.sleep_hours != null);
    
    if (sleepEntries.length === 0) {
        displayNoDataMessage('sleep-chart');
        updateSleepStats([], period);
        return;
    }
    
    // Valmistele data kaaviota varten
    const chartData = sleepEntries.map(entry => ({
        date: new Date(entry.entry_date),
        value: parseFloat(entry.sleep_hours)
    }));
    
    // Renderöi kaavio canvas-elementtiin
    renderLineChart('sleep-chart', chartData, 'Tuntia unta', 'sleep-line');
    
    // Päivitä tilastot
    updateSleepStats(chartData, period);
}

// Päivitä unitilastot
function updateSleepStats(chartData, period) {
    if (!sleepAvg || !sleepMax || !sleepMin || !sleepOptimal) return;
    
    if (chartData.length === 0) {
        sleepAvg.textContent = '-';
        sleepMax.textContent = '-';
        sleepMin.textContent = '-';
        sleepOptimal.textContent = '-';
        return;
    }
    
    // Laske keskiarvo
    const sum = chartData.reduce((total, item) => total + item.value, 0);
    const average = sum / chartData.length;
    sleepAvg.textContent = average.toFixed(1) + ' h';
    
    // Etsi maksimi ja minimi
    const max = Math.max(...chartData.map(item => item.value));
    const min = Math.min(...chartData.map(item => item.value));
    sleepMax.textContent = max.toFixed(1) + ' h';
    sleepMin.textContent = min.toFixed(1) + ' h';
    
    // Laske optimaalisten unipäivien määrä (7-9 tuntia)
    const optimalSleepDays = chartData.filter(item => item.value >= 7 && item.value <= 9).length;
    const optimalPercentage = (optimalSleepDays / chartData.length) * 100;
    sleepOptimal.textContent = optimalPercentage.toFixed(0) + ' %';
}

// Päivitä painokaavio
function updateWeightChart() {
    const period = weightPeriod ? weightPeriod.value : 'month';
    const filteredEntries = filterEntriesByPeriod(period);
    
    // Hae vain merkinnät, joissa on paino-arvo
    const weightEntries = filteredEntries.filter(entry => entry.weight != null);
    
    if (weightEntries.length === 0) {
        displayNoDataMessage('weight-chart');
        updateWeightStats([], period);
        return;
    }
    
    // Valmistele data kaaviota varten
    const chartData = weightEntries.map(entry => ({
        date: new Date(entry.entry_date),
        value: parseFloat(entry.weight)
    }));
    
    // Renderöi kaavio canvas-elementtiin
    renderLineChart('weight-chart', chartData, 'Paino (kg)', 'weight-line');
    
    // Päivitä tilastot
    updateWeightStats(chartData, period);
}

// Päivitä painotilastot
function updateWeightStats(chartData, period) {
    if (!weightCurrent || !weightAvg || !weightChange || !weightVariation) return;
    
    if (chartData.length === 0) {
        weightCurrent.textContent = '-';
        weightAvg.textContent = '-';
        weightChange.textContent = '-';
        weightVariation.textContent = '-';
        return;
    }
    
    // Järjestä data päivämäärän mukaan
    chartData.sort((a, b) => a.date - b.date);
    
    // Nykyinen paino (viimeisin merkintä)
    const currentWeight = chartData[chartData.length - 1].value;
    weightCurrent.textContent = currentWeight.toFixed(1) + ' kg';
    
    // Laske keskiarvo
    const sum = chartData.reduce((total, item) => total + item.value, 0);
    const average = sum / chartData.length;
    weightAvg.textContent = average.toFixed(1) + ' kg';
    
    // Laske muutos (alusta loppuun)
    const firstWeight = chartData[0].value;
    const change = currentWeight - firstWeight;
    const changePercentage = (change / firstWeight) * 100;
    
    if (Math.abs(change) < 0.1) {
        weightChange.textContent = 'Ei muutosta';
        weightChange.style.color = 'var(--text-color)';
    } else if (change > 0) {
        weightChange.textContent = `+${change.toFixed(1)} kg (${changePercentage.toFixed(1)}%)`;
        weightChange.style.color = change > 2 ? 'var(--danger-color)' : 'var(--accent-color)';
    } else {
        weightChange.textContent = `${change.toFixed(1)} kg (${changePercentage.toFixed(1)}%)`;
        weightChange.style.color = change < -2 ? 'var(--accent-color)' : 'var(--secondary-color)';
    }
    
    // Laske vaihtelu (maksimi ja minimi ero)
    const max = Math.max(...chartData.map(item => item.value));
    const min = Math.min(...chartData.map(item => item.value));
    const variation = max - min;
    weightVariation.textContent = variation.toFixed(1) + ' kg';
}

// Päivitä kuukausittainen yhteenveto
function updateMonthlySummaryChart() {
    if (!monthSelector) return;
    
    const selectedMonth = monthSelector.value;
    if (!selectedMonth) return;
    
    const [year, month] = selectedMonth.split('-');
    
    // Hae kaikki valitun kuukauden merkinnät
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0); // Kuukauden viimeinen päivä
    
    const monthEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.entry_date);
        return entryDate >= monthStart && entryDate <= monthEnd;
    });
    
    if (monthEntries.length === 0) {
        displayNoDataMessage('monthly-summary-chart');
        updateMonthlySummaryStats([], month, year);
        return;
    }
    
    // Ryhmittele merkinnät päivittäin
    const dailyData = {};
    
    // Alusta kaikki kuukauden päivät
    for (let day = 1; day <= monthEnd.getDate(); day++) {
        const date = new Date(year, month - 1, day);
        dailyData[day] = {
            date: date,
            mood: null,
            sleep: null,
            weight: null,
            hasEntry: false
        };
    }
    
    // Täytä data merkinnöistä
    monthEntries.forEach(entry => {
        const entryDate = new Date(entry.entry_date);
        const day = entryDate.getDate();
        
        dailyData[day].hasEntry = true;
        if (entry.mood != null) dailyData[day].mood = parseFloat(entry.mood);
        if (entry.sleep_hours != null) dailyData[day].sleep = parseFloat(entry.sleep_hours);
        if (entry.weight != null) dailyData[day].weight = parseFloat(entry.weight);
    });
    
    // Muunna data kaaviota varten
    const chartData = Object.values(dailyData);
    
    // Renderöi kaavio canvas-elementtiin
    renderMonthlySummaryChart('monthly-summary-chart', chartData);
    
    // Päivitä tilastot
    updateMonthlySummaryStats(chartData, monthEntries, monthStart);
}

// Päivitä kuukausittaisen yhteenvedon tilastot
function updateMonthlySummaryStats(chartData, entries, monthStart) {
    if (!monthlyEntryCount || !monthlyMoodAvg || !monthlySleepAvg || !monthlyActivity) return;
    
    if (entries.length === 0) {
        monthlyEntryCount.textContent = '0';
        monthlyMoodAvg.textContent = '-';
        monthlySleepAvg.textContent = '-';
        monthlyActivity.textContent = '0%';
        return;
    }
    
    // Merkintöjen määrä
    monthlyEntryCount.textContent = entries.length;
    
    // Mielialan keskiarvo
    const moodEntries = entries.filter(entry => entry.mood != null);
    if (moodEntries.length > 0) {
        const moodSum = moodEntries.reduce((sum, entry) => sum + parseFloat(entry.mood), 0);
        const moodAvg = moodSum / moodEntries.length;
        monthlyMoodAvg.textContent = moodAvg.toFixed(1) + '/10';
    } else {
        monthlyMoodAvg.textContent = '-';
    }
    
    // Unen keskiarvo
    const sleepEntries = entries.filter(entry => entry.sleep_hours != null);
    if (sleepEntries.length > 0) {
        const sleepSum = sleepEntries.reduce((sum, entry) => sum + parseFloat(entry.sleep_hours), 0);
        const sleepAvg = sleepSum / sleepEntries.length;
        monthlySleepAvg.textContent = sleepAvg.toFixed(1) + ' h';
    } else {
        monthlySleepAvg.textContent = '-';
    }
    
    // Merkintäaktiivisuus
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const daysWithEntries = new Set(entries.map(entry => new Date(entry.entry_date).getDate())).size;
    const activityPercentage = (daysWithEntries / daysInMonth) * 100;
    monthlyActivity.textContent = activityPercentage.toFixed(0) + '%';
}

// Suodata merkinnät ajanjakson mukaan
function filterEntriesByPeriod(period) {
    if (!allEntries || allEntries.length === 0) return [];
    
    const now = new Date();
    let startDate;
    
    switch (period) {
        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
            break;
        case '3month':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 3);
            break;
        case 'year':
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        case 'all':
            return [...allEntries];
        default:
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
    }
    
    return allEntries.filter(entry => new Date(entry.entry_date) >= startDate);
}

// Näytä "ei dataa" -viesti kaavion sijaan
function displayNoDataMessage(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="stats-no-data">
            <i class="fas fa-chart-line"></i>
            <p>Ei riittävästi dataa kaavion näyttämiseen.</p>
            <p>Lisää merkintöjä nähdäksesi tilastot.</p>
        </div>
    `;
}

// Renderöi viivakaavio
function renderLineChart(containerId, data, label, lineClass = '') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Tyhjennä mahdollinen aiempi sisältö
    container.innerHTML = '';
    
    // Jos ei dataa, näytä viesti
    if (data.length === 0) {
        displayNoDataMessage(containerId);
        return;
    }
    
    // Luo canvas-elementti
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Järjestä data päivämäärän mukaan
    data.sort((a, b) => a.date - b.date);
    
    // Määritä kaavion marginaalit
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = canvas.width - margin.left - margin.right;
    const height = canvas.height - margin.top - margin.bottom;
    
    // Skaalaa x- ja y-akselit
    const xScale = width / (data.length - 1 || 1);
    
    const minValue = Math.min(...data.map(d => d.value));
    const maxValue = Math.max(...data.map(d => d.value));
    const valueRange = maxValue - minValue;
    
    // Määritä y-akselin skaalaus, vähintään 10% marginaali ylös ja alas
    const yMin = Math.max(0, minValue - valueRange * 0.1);
    const yMax = maxValue + valueRange * 0.1;
    const yScale = height / (yMax - yMin);
    
    // Piirrä koordinaatisto
    ctx.beginPath();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    
    // Y-akselin viivat ja arvot
    const yTickCount = 5;
    const yTickStep = (yMax - yMin) / yTickCount;
    
    for (let i = 0; i <= yTickCount; i++) {
        const y = margin.top + height - i * (height / yTickCount);
        const value = yMin + i * yTickStep;
        
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + width, y);
        
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'right';
        ctx.fillText(value.toFixed(1), margin.left - 5, y + 5);
    }
    
    // X-akselin viivat ja arvot
    // Jos dataa on alle 10 pistettä, näytetään kaikki päivämäärät
    // Muussa tapauksessa näytetään joka N:s päivämäärä
    const xTickInterval = Math.ceil(data.length / 8);
    
    for (let i = 0; i < data.length; i++) {
        // Näytä joka N:s päivämäärä
        if (i % xTickInterval === 0 || i === data.length - 1) {
            const x = margin.left + i * xScale;
            const date = data[i].date;
            const dateStr = formatDate(date).split(' ')[0]; // Vain päivä ja kuukausi
            
            ctx.moveTo(x, margin.top);
            ctx.lineTo(x, margin.top + height);
            
            ctx.font = '12px Arial';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.fillText(dateStr, x, margin.top + height + 20);
        }
    }
    
    ctx.stroke();
    
    // Piirrä käyrä
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue(lineClass ? `--${lineClass.split('-')[0]}-color` : '--primary-color');
    
    for (let i = 0; i < data.length; i++) {
        const x = margin.left + i * xScale;
        const y = margin.top + height - (data[i].value - yMin) * yScale;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    
    // Piirrä pisteet
    for (let i = 0; i < data.length; i++) {
        const x = margin.left + i * xScale;
        const y = margin.top + height - (data[i].value - yMin) * yScale;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue(lineClass ? `--${lineClass.split('-')[0]}-color` : '--primary-color');
        ctx.stroke();
    }
    
    // Piirrä otsikko
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(label, margin.left + width / 2, margin.top - 5);
}

// Renderöi kuukausittaisen yhteenvedon kaavio
function renderMonthlySummaryChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Tyhjennä mahdollinen aiempi sisältö
    container.innerHTML = '';
    
    // Jos ei dataa, näytä viesti
    if (data.length === 0) {
        displayNoDataMessage(containerId);
        return;
    }
    
    // Luo canvas-elementti
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Järjestä data päivämäärän mukaan
    data.sort((a, b) => a.date - b.date);
    
    // Määritä kaavion marginaalit
    const margin = { top: 20, right: 30, bottom: 60, left: 40 };
    const width = canvas.width - margin.left - margin.right;
    const height = canvas.height - margin.top - margin.bottom;
    
    // Piirtoalueen alkukoordinaatit
    const chartX = margin.left;
    const chartY = margin.top;
    
    // Määritä pylväiden leveys
    const barWidth = width / data.length;
    
    // Piirrä tausta ja reunat
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(chartX, chartY, width, height);
    ctx.strokeStyle = '#ddd';
    ctx.strokeRect(chartX, chartY, width, height);
    
    // Piirrä päivät (x-akseli)
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < data.length; i++) {
        const x = chartX + i * barWidth + barWidth / 2;
        const day = data[i].date.getDate();
        
        // Piirrä päivän numero
        ctx.fillText(day, x, chartY + height + 20);
        
        // Merkitse viikonloppu eri tavalla
        const dayOfWeek = data[i].date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            ctx.fillStyle = 'rgba(220, 220, 220, 0.5)';
            ctx.fillRect(chartX + i * barWidth, chartY, barWidth, height);
            ctx.fillStyle = '#666';
        }
        
        // Merkitse päivät, joissa on merkintä
        if (data[i].hasEntry) {
            // Merkintä mielialasta (värikoodattu)
            if (data[i].mood !== null) {
                const moodColor = getMoodColor(data[i].mood);
                ctx.fillStyle = moodColor;
                ctx.fillRect(chartX + i * barWidth + barWidth * 0.1, chartY + height - 40, barWidth * 0.8, 10);
            }
            
            // Merkintä unesta (sininen)
            if (data[i].sleep !== null) {
                ctx.fillStyle = 'rgba(52, 152, 219, 0.7)';
                ctx.fillRect(chartX + i * barWidth + barWidth * 0.1, chartY + height - 25, barWidth * 0.8, 10);
            }
            
            // Merkintä painosta (vihreä)
            if (data[i].weight !== null) {
                ctx.fillStyle = 'rgba(46, 204, 113, 0.7)';
                ctx.fillRect(chartX + i * barWidth + barWidth * 0.1, chartY + height - 10, barWidth * 0.8, 10);
            }
        }
    }
    
    // Piirrä selite
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    // Mieliala
    ctx.fillStyle = 'rgba(231, 76, 60, 0.7)';
    ctx.fillRect(chartX, chartY + height + 35, 15, 10);
    ctx.fillStyle = '#666';
    ctx.fillText('Mieliala', chartX + 20, chartY + height + 43);
    
    // Uni
    ctx.fillStyle = 'rgba(52, 152, 219, 0.7)';
    ctx.fillRect(chartX + width / 3, chartY + height + 35, 15, 10);
    ctx.fillStyle = '#666';
    ctx.fillText('Uni', chartX + width / 3 + 20, chartY + height + 43);
    
    // Paino
    ctx.fillStyle = 'rgba(46, 204, 113, 0.7)';
    ctx.fillRect(chartX + width * 2/3, chartY + height + 35, 15, 10);
    ctx.fillStyle = '#666';
    ctx.fillText('Paino', chartX + width * 2/3 + 20, chartY + height + 43);
}

// Hae mieliala-arvoa vastaava väri
function getMoodColor(moodValue) {
    // Lineaarinen interpolaatio punaisen ja vihreän välillä
    if (moodValue <= 5) {
        // Huonosta neutraaliin (punainen -> keltainen)
        const t = moodValue / 5;
        const r = 231;
        const g = 76 + t * (219 - 76);
        const b = 60;
        return `rgba(${r}, ${g}, ${b}, 0.7)`;
    } else {
        // Neutraalista hyvään (keltainen -> vihreä)
        const t = (moodValue - 5) / 5;
        const r = 231 - t * (231 - 46);
        const g = 219;
        const b = 60 - t * (60 - 113);
        return `rgba(${r}, ${g}, ${b}, 0.7)`;
    }
}

// Mobiilinavigaation toiminnallisuus
function initializeMobileNav() {
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.add('active');
            mobileNavBackdrop.classList.add('active');
        });
    }
    
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            mobileNavBackdrop.classList.remove('active');
        });
    }
    
    if (mobileNavBackdrop) {
        mobileNavBackdrop.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            mobileNavBackdrop.classList.remove('active');
        });
    }
    
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '../index.html';
        });
    }
}

// Tapahtumankäsittelijät
document.addEventListener('DOMContentLoaded', () => {
    // Alusta mobiilinavigaatio
    initializeMobileNav();
    
    // Hae merkinnät
    fetchAllEntries();
    
    // Lisää tapahtumankäsittelijät
    if (moodPeriod) {
        moodPeriod.addEventListener('change', updateMoodChart);
    }
    
    if (sleepPeriod) {
        sleepPeriod.addEventListener('change', updateSleepChart);
    }
    
    if (weightPeriod) {
        weightPeriod.addEventListener('change', updateWeightChart);
    }
    
    if (monthSelector) {
        monthSelector.addEventListener('change', updateMonthlySummaryChart);
    }
});