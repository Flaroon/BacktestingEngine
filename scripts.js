let selectedStrategy = 'Moving Average Crossover'; // Default strategy

document.addEventListener('DOMContentLoaded', function() {
    // Auto-select the Moving Average Crossover strategy
    selectStrategy('Moving Average Crossover');
});

document.getElementById('backtest-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const symbol = document.getElementById('symbol').value;
    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;

    fetchStockData(symbol, startDate, endDate)
        .then(data => {
            if (data) {
                const filteredData = processAlphaVantageData(data);
                const strategyResults = runCustomStrategy(filteredData); 
                plotCandlestickChart(filteredData, strategyResults);
                displayPerformanceMetrics(strategyResults);
            } else {
                alert('Error fetching data. Please check the stock symbol and try again.');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            alert('There was a problem with the fetch operation: ' + error.message);
        });
});

function selectStrategy(strategyName) {
    selectedStrategy = strategyName;

    // Visually indicate the selected strategy button
    const buttons = document.querySelectorAll('.strategy-button');
    buttons.forEach(button => {
        if (button.getAttribute('data-strategy') === strategyName) {
            button.classList.add('selected'); // Add a class to indicate selection
        } else {
            button.classList.remove('selected');
        }
    });

    document.querySelector('.performance-section h2').textContent = `Strategy Performance (${strategyName})`;
    resetPerformanceMetrics();
    showStrategyVariables(strategyName);
    showStrategyInformation(strategyName);
}



function fetchStockData(symbol, startDate, endDate) {
    const API_HOST = 'https://alpha-vantage.p.rapidapi.com';
    const API_KEY = 'c8b8cee830mshca97325be9f038cp138d6cjsnce0f38559af9';  // Replace this with your RapidAPI key

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com'
        }
    };

    const url = `${API_HOST}/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&datatype=json`;

    return fetch(url, options)
        .then(response => response.json())
        .then(data => {
            const allData = data['Time Series (Daily)'] || null;
            if (!allData) return null;

            // Filter the data by the provided start and end date
            const filteredData = Object.keys(allData)
                .filter(date => date >= startDate && date <= endDate)
                .reduce((obj, date) => {
                    obj[date] = allData[date];
                    return obj;
                }, {});

            return filteredData;
        });
}

function processAlphaVantageData(data) {
    return Object.keys(data).map(date => ({
        date: date,
        open: parseFloat(data[date]['1. open']),
        high: parseFloat(data[date]['2. high']),
        low: parseFloat(data[date]['3. low']),
        close: parseFloat(data[date]['4. close'])
    }));
}


function showStrategyInformation(strategyName) {
    const strategyInfo = document.getElementById('strategy-info');
    const strategyTitle = document.getElementById('strategy-info-title');
    
    let infoText = '';
    let titleText = strategyName; // Default title is the strategy name
    
    switch (strategyName) {
        case 'Moving Average Crossover':
            infoText = `
                <p>The <strong>Moving Average Crossover</strong> strategy is a widely used trend-following strategy. It involves two moving averages of different lengths: a shorter-term moving average and a longer-term moving average. 
                A buy signal is generated when the short-term moving average crosses above the long-term moving average, signaling a potential uptrend. Conversely, a sell signal is triggered when the short-term moving average crosses below the long-term moving average, indicating a potential downtrend.</p>
                
                <h4>Mathematics:</h4>
                <p>The <strong>Moving Average (MA)</strong> is a commonly used technical indicator that smooths out price data by creating a constantly updated average price. It helps traders identify the direction of the trend by filtering out the noise from random short-term price fluctuations.</p>
                <p><strong>Simple Moving Average (SMA)</strong> is calculated as:</p>
                $$SMA_n = \\frac{P_1 + P_2 + \\dots + P_n}{n}$$
                <p>where \\(P_1, P_2, \\dots, P_n\\) are the closing prices over \\(n\\) periods.</p>
                
                <p><strong>Exponential Moving Average (EMA)</strong> gives more weight to recent prices, making it more responsive to new information:</p>
                $$EMA_n = P_{today} \\times \\left(\\frac{2}{n + 1}\\right) + EMA_{yesterday} \\times \\left(1 - \\frac{2}{n + 1}\\right)$$
                <p>where \\(P_{today}\\) is the closing price today, and \\(EMA_{yesterday}\\) is the EMA calculated for the previous day.</p>

                <h4>Application in Trading:</h4>
                <p>The Moving Average Crossover strategy is particularly useful in trending markets. It helps traders identify the beginning of a trend and stay in the trade until the trend shows signs of reversing. However, it can generate false signals in sideways markets where prices oscillate in a narrow range without establishing a clear trend.</p>
                <p>Traders often combine this strategy with other indicators, such as the Relative Strength Index (RSI) or the Moving Average Convergence Divergence (MACD), to confirm signals and reduce the likelihood of entering trades based on false breakouts.</p>

                <h4>History:</h4>
                <p>The concept of moving averages dates back to the early 20th century. The first known use of moving averages in trading was by the American mathematician and investor Alfred Cowles in the 1930s. The use of moving averages gained popularity in the 1970s and 1980s as computers became more accessible, allowing traders to easily calculate and plot moving averages on price charts.</p>
                
                <h4>Improvements and Variations:</h4>
                <ul>
                    <li><strong>Weighted Moving Averages (WMA)</strong>: More recent prices are given more weight, making the MA more responsive to recent price changes. This variation can help reduce the lag associated with SMAs.</li>
                    <li><strong>Adaptive Moving Averages (AMA)</strong>: These adjust the length of the moving average based on market volatility, making the MA more responsive during volatile periods and smoother during stable periods.</li>
                    <li><strong>Double or Triple Crossover Strategies</strong>: These involve the use of two or three moving averages of different lengths. A double crossover strategy might involve a 50-day and a 200-day MA, while a triple crossover could add a 100-day MA to the mix.</li>
                    <li><strong>Moving Average Envelopes</strong>: These are bands plotted at a certain percentage above and below a moving average, used to identify overbought and oversold conditions, as well as potential breakout points.</li>
                    <li><strong>Backtesting and Optimization</strong>: Modern traders use historical data to backtest and optimize the parameters of the Moving Average Crossover strategy, such as the period lengths for the MAs, to maximize profitability and minimize risk.</li>
                </ul>

                <h4>Considerations:</h4>
                <p>While the Moving Average Crossover strategy can be powerful, it is not without its drawbacks. The primary concern is the lag associated with moving averages, especially SMAs, which can cause traders to enter or exit trades late. This lag can result in missed opportunities or late exits that give back a significant portion of profits.</p>
                <p>Another consideration is the possibility of false signals, particularly in choppy or range-bound markets. Traders often use additional indicators or filters, such as volume analysis or trend strength indicators, to confirm the signals generated by the crossover strategy.</p>
            `;
            break;
        case 'RSI':
            infoText = `
                <p>The <strong>Relative Strength Index (RSI)</strong> is a momentum oscillator that measures the speed and change of price movements. It was developed by J. Welles Wilder Jr. in 1978 and introduced in his book "New Concepts in Technical Trading Systems." 
                The RSI oscillates between 0 and 100, with values above 70 traditionally considered overbought and values below 30 considered oversold. These thresholds can signal potential trend reversals.</p>
                
                <h4>Mathematics:</h4>
                <p>The RSI is calculated using the following formula:</p>
                $$RSI = 100 - \\frac{100}{1 + RS}$$
                <p>where:</p>
                $$RS = \\frac{Average \\ Gain}{Average \\ Loss}$$
                <p><strong>Average Gain</strong> is the average of all positive price changes over the last \\(n\\) periods, and <strong>Average Loss</strong> is the average of all negative price changes over the same period.</p>

                <h4>Application in Trading:</h4>
                <p>The RSI is primarily used to identify overbought and oversold conditions in a market. When the RSI crosses above 70, the asset is generally considered overbought, which could be a signal to sell. Conversely, when the RSI crosses below 30, the asset is considered oversold, which could be a signal to buy.</p>
                <p>Traders often use the RSI in conjunction with other indicators, such as moving averages or trend lines, to confirm signals and avoid acting on false positives. Additionally, the RSI can be used to identify the strength of a trend, as a strong trend will typically keep the RSI in the overbought or oversold range for an extended period.</p>

                <h4>History:</h4>
                <p>J. Welles Wilder Jr. developed the RSI as part of his pioneering work in technical analysis. Introduced in 1978, the RSI quickly became a staple in the toolkit of traders due to its simplicity and effectiveness in various market conditions. Wilder's contributions to technical analysis, including the RSI, Average True Range (ATR), and the Parabolic SAR, have had a lasting impact on trading strategies used today.</p>
                
                <h4>Improvements and Variations:</h4>
                <ul>
                    <li><strong>Stochastic RSI</strong>: This variation combines the RSI with the stochastic oscillator to increase sensitivity to recent price changes. The Stochastic RSI is calculated by applying the stochastic formula to RSI values rather than price data, providing an indicator that oscillates between 0 and 100, just like the RSI.</li>
                    <li><strong>Divergence Analysis</strong>: Traders often look for divergences between the RSI and price movements to predict potential reversals. A bullish divergence occurs when the price makes a new low, but the RSI makes a higher low. Conversely, a bearish divergence occurs when the price makes a new high, but the RSI makes a lower high.</                    <li><strong>RSI Bands</strong>: Similar to Bollinger Bands, RSI Bands are plotted at standard deviations away from the RSI, helping traders identify extreme overbought and oversold conditions dynamically. These bands can adjust to market volatility, providing more context to RSI readings.</li>
                    <li><strong>Dynamic RSI</strong>: Some traders adjust the overbought and oversold thresholds based on the asset’s volatility or market conditions, rather than sticking strictly to the 70/30 rule. This can help reduce the number of false signals in highly volatile or trending markets.</li>
                    <li><strong>RSI with Moving Averages</strong>: Combining RSI with moving averages of the RSI itself can help smooth out the oscillator and reduce the impact of short-term fluctuations, making it easier to identify the underlying trend.</li>
                </ul>

                <h4>Considerations:</h4>
                <p>The RSI is a powerful tool, but it is not without limitations. In strong trending markets, the RSI can remain in overbought or oversold territory for extended periods, potentially leading to premature exits or missed opportunities. This phenomenon, known as "RSI failure swings," occurs when the RSI fails to return to neutral levels before resuming the previous trend.</p>
                <p>Another consideration is that the RSI is most effective in markets that are moving between overbought and oversold levels, rather than in trending markets where the RSI can produce false signals. Traders often use the RSI in conjunction with other indicators or chart patterns to confirm signals and reduce the likelihood of entering trades based on incorrect assumptions about market conditions.</p>
            `;
            break;
        case 'MACD':
            infoText = `
                <p>The <strong>Moving Average Convergence Divergence (MACD)</strong> is a trend-following momentum indicator that shows the relationship between two moving averages of a security’s price. Developed by Gerald Appel in the late 1970s, the MACD is used to identify changes in the strength, direction, momentum, and duration of a trend.</p>
                
                <h4>Mathematics:</h4>
                <p>The MACD is calculated by subtracting the 26-period Exponential Moving Average (EMA) from the 12-period EMA:</p>
                $$MACD = EMA_{12} - EMA_{26}$$
                <p>This calculation produces the MACD line. Additionally, a 9-period EMA of the MACD line, known as the Signal Line, is plotted on top of the MACD line, which can trigger buy and sell signals:</p>
                $$Signal \\ Line = EMA_9(MACD)$$
                <p>Traders often look for crossovers between the MACD line and the Signal Line to identify potential trading opportunities. A bullish crossover occurs when the MACD line crosses above the Signal Line, while a bearish crossover occurs when the MACD line crosses below the Signal Line.</p>
                <p>Another key component of the MACD is the MACD Histogram, which represents the difference between the MACD line and the Signal Line:</p>
                $$MACD \\ Histogram = MACD - Signal \\ Line$$
                <p>The histogram helps traders visualize the momentum of the trend and spot potential reversals.</p>

                <h4>Application in Trading:</h4>
                <p>The MACD is widely used for identifying trends and momentum. It is particularly effective in trending markets, where it can help traders enter positions in the direction of the trend and exit before the trend reverses. Traders often look for three main types of signals when using the MACD:</p>
                <ul>
                    <li><strong>Crossovers</strong>: As mentioned, crossovers between the MACD line and the Signal Line are the most common signals. A bullish crossover suggests a buy opportunity, while a bearish crossover suggests a sell opportunity.</li>
                    <li><strong>Divergence</strong>: Divergence occurs when the price of a security is moving in the opposite direction of the MACD. A bullish divergence happens when the price is making lower lows while the MACD is making higher lows, indicating potential upward momentum. Conversely, a bearish divergence occurs when the price is making higher highs while the MACD is making lower highs, suggesting potential downward momentum.</li>
                    <li><strong>Overbought/Oversold Conditions</strong>: Although not a traditional use of the MACD, some traders use extreme values in the MACD as indications of overbought or oversold conditions, similar to the RSI.</li>
                </ul>

                <h4>History:</h4>
                <p>Gerald Appel developed the MACD in the late 1970s as a tool for his clients. The indicator quickly gained popularity due to its simplicity and effectiveness. Over the years, the MACD has become one of the most widely used indicators in technical analysis, commonly found in various trading platforms and charting software.</p>
                
                <h4>Improvements and Variations:</h4>
                <ul>
                    <li><strong>MACD Histogram</strong>: The MACD Histogram, introduced by Thomas Aspray in 1986, enhances the original MACD by visually representing the difference between the MACD line and the Signal Line. The histogram provides a clearer view of the momentum, helping traders spot divergences and potential reversals more easily.</li>
                    <li><strong>Double MACD</strong>: This variation involves using two MACD lines with different settings (e.g., 12, 26, 9 and 19, 39, 9) to filter out false signals and improve trend-following capabilities.</li>
                    <li><strong>MACD with RSI</strong>: Combining the MACD with the RSI can provide more robust signals by confirming momentum shifts with overbought/oversold conditions. For example, a bullish MACD crossover occurring when the RSI is below 30 can strengthen the buy signal.</li>
                    <li><strong>Zero Line Crosses</strong>: Some traders focus on the MACD line crossing the zero line (the point where the two EMAs are equal) as an additional signal. A move above the zero line suggests a bullish trend, while a move below suggests a bearish trend.</li>
                    <li><strong>Signal Line as a Standalone Indicator</strong>: In some cases, traders use the Signal Line by itself, especially in strategies where they want to smooth out the MACD line further.</li>
                </ul>

                <h4>Considerations:</h4>
                <p>The MACD is a versatile tool, but like all indicators, it has limitations. One key consideration is its lagging nature due to the use of moving averages. This lag can sometimes cause traders to enter or exit trades late, particularly in fast-moving markets. To mitigate this, traders often use the MACD in conjunction with leading indicators or other forms of analysis, such as chart patterns or support and resistance levels.</p>
                <p>Another consideration is the potential for false signals, especially during periods of low volatility or in choppy markets. In such conditions, the MACD can produce whipsaws—signals that indicate a trend change that quickly reverses—leading to losses. Traders may use additional filters, such as waiting for confirmation from other indicators or looking for signals only in the direction of the prevailing trend, to reduce the impact of false signals.</p>
            `;
            break;
        case 'Bollinger Bands':
            infoText = `
                <p><strong>Bollinger Bands</strong> were developed by John Bollinger in the 1980s and have since become one of the most popular tools for measuring market volatility. Bollinger Bands consist of three lines: a middle band, which is typically a 20-period Simple Moving Average (SMA), and two outer bands plotted two standard deviations away from the middle band. These outer bands expand and contract based on market volatility, providing a dynamic range within which the price typically trades.</p>
                
                <h4>Mathematics:</h4>
                <p>The Middle Band is calculated as a 20-period SMA:</p>
                $$Middle \\ Band = SMA_{20}$$
                <p>The Upper and Lower Bands are calculated as follows:</p>
                $$Upper \\ Band = Middle \\ Band + (2 \\times \\sigma_{20})$$
                $$Lower \\ Band = Middle \\ Band - (2 \\times \\sigma_{20})$$
                <p>where \\(\\sigma_{20}\\) represents the standard deviation of the closing prices over the last 20 periods. The use of standard deviation ensures that the bands automatically widen during periods of high volatility and contract during periods of low volatility.</p>

                <h4>Application in Trading:</h4>
                <p>Bollinger Bands are primarily used to identify overbought and oversold conditions. When the price approaches the upper band, the asset may be considered overbought, potentially signaling a sell opportunity. Conversely, when the price approaches the lower band, the asset may be considered oversold, potentially signaling a buy opportunity.</p>
                <p>Traders also use Bollinger Bands to identify potential breakouts. A breakout occurs when the price moves outside the bands. While this is not a signal in itself, it can indicate a continuation of the current trend if accompanied by strong volume. Some traders look for Bollinger Band squeezes—periods when the bands contract tightly—as these often precede significant price moves.</p>

                <h4>History:</h4>
                <p>John Bollinger, a financial analyst, developed Bollinger Bands in the early 1980s as a method to adapt moving averages to changing market conditions. By incorporating standard deviation into the bands, Bollinger Bands provide a more dynamic and responsive measure of volatility compared to traditional moving averages. Bollinger's work was groundbreaking in its approach to volatility analysis, and Bollinger Bands have since become a standard tool in technical analysis.</p>
                
                <h4>Improvements and Variations:</h4>
                <ul>
                    <li><strong>Bollinger Band Squeeze</strong>: This is a popular setup where the bands contract tightly, indicating a period of low volatility. Traders interpret this as a potential precursor to a significant price movement, either up or down. A squeeze followed by a breakout often leads to a strong directional move.</li>
                    <li><strong>Double Bollinger Bands</strong>: This variation uses two sets of Bollinger Bands—typically with 1 and 2 standard deviations. This setup helps traders identify more precise entry and exit points by distinguishing between normal volatility and more extreme conditions.</li>
                    <li><strong>Bollinger Bandwidth</strong>: This is a technical indicator derived from Bollinger Bands that measures the distance between the upper and lower bands. The Bandwidth can help traders identify periods of low or high volatility and anticipate potential breakouts.</li>
                    <li><strong>Bollinger Bands with %B</strong>: %B is an indicator that shows where the price is relative to the bands. It ranges from 0 to 1, with values above 1 indicating the price is above the upper band and values below 0 indicating the price is below the lower band. %B can help identify trend strength and potential reversals.</li>
                    <li><strong>Bollinger Bands with Other Indicators</strong>: Bollinger Bands are often used in conjunction with other indicators, such as the RSI or MACD, to confirm signals. For example, a price touching the lower Bollinger Band while the RSI is in oversold territory might strengthen the case for a buy signal.</li>
                </ul>

                <h4>Considerations:</h4>
                <p>While Bollinger Bands are a versatile tool, they are not infallible. One limitation is that they are based on historical data and therefore may lag behind current market conditions. This lag can result in false signals, especially during periods of sudden volatility. Additionally, while Bollinger Bands can indicate potential overbought and oversold conditions, these are not guaranteed reversal points; in strong trends, prices can remain overbought or oversold for extended periods.</p>
                <p>Another consideration is the use of standard deviation in the calculation of the bands. While standard deviation is a robust measure of volatility, it assumes a normal distribution of price movements, which may not always be the case in financial markets. Traders often need to adjust the parameters of Bollinger Bands based on the specific asset and market conditions to improve accuracy.</p>
            `;
            break;
        case 'Momentum':
            infoText = `
                <p>The <strong>Momentum</strong> strategy is based on the principle that assets that have performed well in the recent past are likely to continue performing well in the near future, and those that have performed poorly are likely to continue underperforming. Momentum is one of the most straightforward and widely used strategies in technical analysis, particularly in trend-following systems.</p>
                
                <h4>Mathematics:</h4>
                <p>Momentum is typically calculated by comparing the current price of an asset to its price a certain number of periods ago:</p>
                $$Momentum = P_{today} - P_{n \\ periods \\ ago}$$
                <p>Alternatively, it can be expressed as a ratio or percentage:</p>
                $$Momentum \\ Ratio = \\frac{P_{today}}{P_{n \\ periods \\ ago}}$$
                $$Momentum \\ Percentage = \\left( \\frac{P_{today} - P_{n \\ periods \\ ago}}{P_{n \\ periods \\ ago}} \\right) \\times 100$$
                <p>The resulting momentum value is then used to determine whether an asset is gaining or losing strength. Positive momentum indicates that the asset is gaining strength, while negative momentum suggests it is losing strength.</p>

                <h4>Application in Trading:</h4>
                <p>Momentum strategies are widely used in trend-following and breakout trading. Traders often buy assets that are showing strong positive momentum, expecting the trend to continue, and sell assets with negative momentum, anticipating further declines. The momentum strategy can be applied across various timeframes, from short-term intraday trading to long-term investing.</p>
                <p>A common approach is to use momentum indicators in conjunction with other technical analysis tools, such as moving averages or trendlines, to confirm the strength of a trend. For example, a trader might look for a stock that has broken out of a key resistance level with strong momentum as a signal to enter a long position.</p>

                <h4>History:</h4>
                <p>The concept of momentum has been recognized in financial markets for centuries, but it was formalized as an investment strategy in the 1990s. Academic research, such as the work by Jegadeesh and Titman in 1993, provided empirical evidence supporting the momentum effect in stock returns. Their research showed that stocks with strong past performance tend to continue to perform well in the future, while those with poor past performance tend to continue to underperform. This discovery led to the widespread adoption of momentum strategies in both institutional and retail trading.</p>
                
                <h4>Improvements and Variations:</h4>
                <ul>
                    <li><strong>Relative Momentum</strong>: This variation compares the momentum of a stock against a benchmark index or a group of stocks to identify relative strength. Traders may choose to invest in stocks that show stronger momentum relative to their peers or the broader market.</li>
                    <li><strong>Dual Momentum</strong>: Developed by Gary Antonacci, dual momentum combines both absolute and relative momentum to enhance strategy robustness. Absolute momentum looks at the asset’s performance in isolation, while relative momentum compares its performance to other assets.</li>
                    <li><strong>Momentum Oscillators</strong>: Indicators like the RSI and Stochastic Oscillator are used to refine entry and exit points within a momentum strategy. These oscillators can help identify overbought or oversold conditions, even within a strong momentum trend.</li>
                    <li><strong>Momentum with Moving Averages</strong>: Some traders use moving averages to smooth the momentum indicator, reducing the impact of short-term price fluctuations. For example, a 10-period moving average of momentum can help identify the underlying trend more clearly.</li>
                    <li><strong>Seasonal Momentum</strong>: This approach considers the time of year or specific cycles that may influence momentum. For example, certain sectors or assets might exhibit strong seasonal momentum during specific months or quarters.</li>
                </ul>

                <h4>Considerations:</h4>
                <p>While momentum is a powerful tool, it is important to recognize its limitations. One of the main risks of momentum trading is the potential for reversals, where a strong trend suddenly changes direction. This can lead to significant losses if traders are caught on the wrong side of the trade. To mitigate this risk, many traders use stop-loss orders or combine momentum strategies with other indicators that can signal potential trend reversals, such as MACD or RSI.</p>
                <p>Another consideration is the impact of market conditions on momentum. In strong bull or bear markets, momentum strategies can be highly effective. However, in choppy or range-bound markets, momentum can generate false signals, leading to whipsaws and losses. Traders need to be aware of the broader market context and adjust their strategies accordingly.</p>
                <p>Finally, momentum strategies can be prone to overcrowding, where too many traders are following the same signals, leading to crowded trades that can quickly reverse as participants exit their positions en masse. Diversifying across multiple assets or sectors can help reduce this risk.</p>
            `;
            break;
        default:
            titleText = 'Strategy Information';
            infoText = 'Select a strategy to see details here.';
            break;
    }
    
    strategyTitle.textContent = titleText; // Update the title
    strategyInfo.innerHTML = infoText; // Update the information
    
    // Trigger MathJax to reprocess the new content
    MathJax.typeset();
}




function showStrategyVariables(strategyName) {
    const variablePanel = document.getElementById('variable-panel');
    const variablesContainer = document.getElementById('variables-container');
    
    // Clear any previous variables
    variablesContainer.innerHTML = '';
    
    // Show the panel
    variablePanel.style.display = 'block';
    
    // Define variables for each strategy
    let variablesHTML = '';
    
    switch (strategyName) {
        case 'Moving Average Crossover':
            variablesHTML = `
                <label for="short-term-ma">Short Term MA:</label>
                <input type="number" id="short-term-ma" value="2" min="1">
                <label for="long-term-ma">Long Term MA:</label>
                <input type="number" id="long-term-ma" value="4" min="1">
            `;
            break;
        case 'RSI':
            variablesHTML = `
                <label for="rsi-period">RSI Period:</label>
                <input type="number" id="rsi-period" value="14" min="1">
                <label for="overbought">Overbought Level:</label>
                <input type="number" id="overbought" value="70" min="1" max="100">
                <label for="oversold">Oversold Level:</label>
                <input type="number" id="oversold" value="30" min="1" max="100">
            `;
            break;
        case 'MACD':
            variablesHTML = `
                <label for="short-term-ema">Short Term EMA:</label>
                <input type="number" id="short-term-ema" value="12" min="1">
                <label for="long-term-ema">Long Term EMA:</label>
                <input type="number" id="long-term-ema" value="26" min="1">
                <label for="signal-line-ema">Signal Line EMA:</label>
                <input type="number" id="signal-line-ema" value="9" min="1">
            `;
            break;
        case 'Bollinger Bands':
            variablesHTML = `
                <label for="ma-period">Moving Average Period:</label>
                <input type="number" id="ma-period" value="20" min="1">
                <label for="std-multiplier">Standard Deviation Multiplier:</label>
                <input type="number" id="std-multiplier" value="2" min="1">
            `;
            break;
        case 'Momentum':
            variablesHTML = `
                <label for="momentum-period">Momentum Period:</label>
                <input type="number" id="momentum-period" value="10" min="1">
            `;
            break;
    }
    
    variablesContainer.innerHTML = variablesHTML;
}


function resetPerformanceMetrics() {
    document.getElementById('total-return').textContent = 'Total Return: --';
    document.getElementById('number-of-trades').textContent = 'Number of Trades: --';
    document.getElementById('final-portfolio-value').textContent = 'Final Portfolio Value: --';
    document.getElementById('starting-portfolio-value').textContent = 'Starting Portfolio Value: --';
    document.getElementById('profit').textContent = 'Profit: --';
}

function displayPerformanceMetrics(strategyResults) {
    const startingPortfolioValue = strategyResults.portfolioValue[strategyResults.portfolioValue.length - 1].value;
    const finalPortfolioValue = strategyResults.portfolioValue[0].value;
    const totalReturn = ((finalPortfolioValue - startingPortfolioValue) / startingPortfolioValue) * 100;
    const numberOfTrades = strategyResults.buySignals.length + strategyResults.sellSignals.length;
    const profit = finalPortfolioValue - startingPortfolioValue;

    document.getElementById('total-return').textContent = `Total Return: ${totalReturn.toFixed(2)}%`;
    document.getElementById('number-of-trades').textContent = `Number of Trades: ${numberOfTrades}`;
    document.getElementById('final-portfolio-value').textContent = `Final Portfolio Value: $${finalPortfolioValue.toFixed(2)}`;
    document.getElementById('starting-portfolio-value').textContent = `Starting Portfolio Value: $${startingPortfolioValue.toFixed(2)}`;
    document.getElementById('profit').textContent = `Profit: $${profit.toFixed(2)}`;
}


function runCustomStrategy(data) {
    switch (selectedStrategy) {
        case 'Moving Average Crossover':
            return runMACrossoverStrategy(data);
        case 'RSI':
            return runRSIStrategy(data);
        case 'MACD':
            return runMACDStrategy(data);
        case 'Bollinger Bands':
            return runBollingerBandsStrategy(data);
        case 'Momentum':
            return runMomentumStrategy(data);
        default:
            return runMACrossoverStrategy(data);  // Default to MA Crossover if none selected
    }
}
function runMACrossoverStrategy(data) {
    const shortTermWindow = parseInt(document.getElementById('short-term-ma').value, 10) || 2;
    const longTermWindow = parseInt(document.getElementById('long-term-ma').value, 10) || 4;
    
    let cash = data[0].open; // Set initial cash to the opening price of the first day
    let position = 0;
    let portfolioValue = [{ date: data[0].date, value: cash }]; // Track starting value
    let buySignals = [];
    let sellSignals = [];

    const shortTermMA = [];
    const longTermMA = [];

    data.forEach((day, index) => {
        const close = day.close;

        shortTermMA.push(close);
        if (shortTermMA.length > shortTermWindow) shortTermMA.shift();
        const shortMA = shortTermMA.reduce((acc, val) => acc + val, 0) / shortTermMA.length;

        longTermMA.push(close);
        if (longTermMA.length > longTermWindow) longTermMA.shift();
        const longMA = longTermMA.reduce((acc, val) => acc + val, 0) / longTermMA.length;

        if (index >= longTermWindow) { 
            if (position === 0 && shortMA > longMA) {
                position = cash / close;
                cash = 0;
                buySignals.push({ date: day.date, price: close });
            } else if (position > 0 && shortMA < longMA) {
                cash = position * close;
                position = 0;
                sellSignals.push({ date: day.date, price: close });
            }
        }

        portfolioValue.push({
            date: day.date,
            value: cash + position * close
        });
    });

    return { portfolioValue, buySignals, sellSignals };
}

function runRSIStrategy(data) {
    const rsiPeriod = parseInt(document.getElementById('rsi-period').value, 10) || 14;
    const overbought = parseInt(document.getElementById('overbought').value, 10) || 70;
    const oversold = parseInt(document.getElementById('oversold').value, 10) || 30;
    
    let cash = data[0].open;
    let position = 0;
    let portfolioValue = [{ date: data[0].date, value: cash }];
    let buySignals = [];
    let sellSignals = [];
    let gains = [];
    let losses = [];

    data.forEach((day, index) => {
        if (index > 0) {
            const change = day.close - data[index - 1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);

            if (gains.length > rsiPeriod) gains.shift();
            if (losses.length > rsiPeriod) losses.shift();

            const avgGain = gains.reduce((acc, val) => acc + val, 0) / gains.length;
            const avgLoss = losses.reduce((acc, val) => acc + val, 0) / losses.length;
            const rs = avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));

            if (rsi < oversold && position === 0) {
                position = cash / day.close;
                cash = 0;
                buySignals.push({ date: day.date, price: day.close });
            } else if (rsi > overbought && position > 0) {
                cash = position * day.close;
                position = 0;
                sellSignals.push({ date: day.date, price: day.close });
            }
        }

        portfolioValue.push({
            date: day.date,
            value: cash + position * day.close
        });
    });

    return { portfolioValue, buySignals, sellSignals };
}

function runMACDStrategy(data) {
    const shortTermEMA = parseInt(document.getElementById('short-term-ema').value, 10) || 12;
    const longTermEMA = parseInt(document.getElementById('long-term-ema').value, 10) || 26;
    const signalLineEMA = parseInt(document.getElementById('signal-line-ema').value, 10) || 9;
    
    let cash = data[0].open;
    let position = 0;
    let portfolioValue = [{ date: data[0].date, value: cash }];
    let buySignals = [];
    let sellSignals = [];

    let emaShort = [];
    let emaLong = [];
    let macd = [];
    let signalLine = [];

    data.forEach((day, index) => {
        const close = day.close;
        if (index === 0) {
            emaShort.push(close);
            emaLong.push(close);
            signalLine.push(0);
        } else {
            const previousEmaShort = emaShort[emaShort.length - 1];
            const previousEmaLong = emaLong[emaLong.length - 1];

            emaShort.push((close - previousEmaShort) * (2 / (shortTermEMA + 1)) + previousEmaShort);
            emaLong.push((close - previousEmaLong) * (2 / (longTermEMA + 1)) + previousEmaLong);

            const currentMacd = emaShort[emaShort.length - 1] - emaLong[emaLong.length - 1];
            macd.push(currentMacd);

            const previousSignalLine = signalLine[signalLine.length - 1];
            signalLine.push((currentMacd - previousSignalLine) * (2 / (signalLineEMA + 1)) + previousSignalLine);

            if (index > signalLineEMA) {
                const previousMacd = macd[macd.length - 2];
                const currentSignalLine = signalLine[signalLine.length - 1];

                if (position === 0 && previousMacd < currentSignalLine && currentMacd > currentSignalLine) {
                    position = cash / close;
                    cash = 0;
                    buySignals.push({ date: day.date, price: close });
                } else if (position > 0 && previousMacd > currentSignalLine && currentMacd < currentSignalLine) {
                    cash = position * close;
                    position = 0;
                    sellSignals.push({ date: day.date, price: close });
                }
            }
        }

        portfolioValue.push({
            date: day.date,
            value: cash + position * close
        });
    });

    return { portfolioValue, buySignals, sellSignals };
}

function runBollingerBandsStrategy(data) {
    const movingAveragePeriod = parseInt(document.getElementById('ma-period').value, 10) || 20;
    const standardDeviationMultiplier = parseInt(document.getElementById('std-multiplier').value, 10) || 2;
    
    let cash = data[0].open;
    let position = 0;
    let portfolioValue = [{ date: data[0].date, value: cash }];
    let buySignals = [];
    let sellSignals = [];
    let movingAverage = [];

    data.forEach((day, index) => {
        movingAverage.push(day.close);

        if (movingAverage.length > movingAveragePeriod) {
            movingAverage.shift();
        }

        const mean = movingAverage.reduce((acc, val) => acc + val, 0) / movingAverage.length;
        const standardDeviation = Math.sqrt(movingAverage.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / movingAverage.length);
        const upperBand = mean + (standardDeviationMultiplier * standardDeviation);
        const lowerBand = mean - (standardDeviationMultiplier * standardDeviation);

        if (index >= movingAveragePeriod) {
            if (position === 0 && day.close < lowerBand) {
                position = cash / day.close;
                cash = 0;
                buySignals.push({ date: day.date, price: day.close });
            } else if (position > 0 && day.close > upperBand) {
                cash = position * day.close;
                position = 0;
                sellSignals.push({ date: day.date, price: day.close });
            }
        }

        portfolioValue.push({
            date: day.date,
            value: cash + position * day.close
        });
    });

    return { portfolioValue, buySignals, sellSignals };
}

function runMomentumStrategy(data) {
    const momentumPeriod = parseInt(document.getElementById('momentum-period').value, 10) || 10;
    
    let cash = data[0].open;
    let position = 0;
    let portfolioValue = [{ date: data[0].date, value: cash }];
    let buySignals = [];
    let sellSignals = [];
    let momentum = [];

    data.forEach((day, index) => {
        if (index >= momentumPeriod) {
            const momentumValue = day.close - data[index - momentumPeriod].close;
            momentum.push(momentumValue);

            if (position === 0 && momentumValue > 0) {
                position = cash / day.close;
                cash = 0;
                buySignals.push({ date: day.date, price: day.close });
            } else if (position > 0 && momentumValue < 0) {
                cash = position * day.close;
                position = 0;
                sellSignals.push({ date: day.date, price: day.close });
            }
        }

        portfolioValue.push({
            date: day.date,
            value: cash + position * day.close
        });
    });

    return { portfolioValue, buySignals, sellSignals };
}


function plotCandlestickChart(candlestickData, strategyData) {
    const dates = candlestickData.map(d => d.date);
    const opens = candlestickData.map(d => d.open);
    const highs = candlestickData.map(d => d.high);
    const lows = candlestickData.map(d => d.low);
    const closes = candlestickData.map(d => d.close);

    const traceCandlestick = {
        x: dates,
        close: closes,
        decreasing: {line: {color: '#F44336'}}, // Red for decreasing
        high: highs,
        increasing: {line: {color: '#4CAF50'}}, // Green for increasing
        line: {color: 'rgba(31,119,180,1)'},
        low: lows,
        open: opens,
        type: 'candlestick',
        xaxis: 'x',
        yaxis: 'y'
    };

    const traceStrategy = {
        x: strategyData.portfolioValue.map(d => d.date),
        y: strategyData.portfolioValue.map(d => d.value),
        type: 'scatter',
        mode: 'lines',
        line: {
            color: '#1f77b4',
            width: 2
        },
        name: 'Strategy Portfolio Value'
    };

    // Buy signals
    const traceBuySignals = {
        x: strategyData.buySignals.map(s => s.date),
        y: strategyData.buySignals.map(s => s.price),
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'green',
            symbol: 'triangle-up',
            size: 10
        },
        name: 'Buy Signal'
    };

    // Sell signals
    const traceSellSignals = {
        x: strategyData.sellSignals.map(s => s.date),
        y: strategyData.sellSignals.map(s => s.price),
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'red',
            symbol: 'triangle-down',
            size: 10
        },
        name: 'Sell Signal'
    };

    const layout = {
        dragmode: 'zoom',
        margin: {
            r: 10,
            t: 25,
            b: 40,
            l: 60
        },
        showlegend: true,
        legend: {
            orientation: 'h',
            x: 0,
            y: -0.2,
            xanchor: 'left',
            yanchor: 'top',
            itemwidth: 100,
            itemsizing: 'constant',
            font: {
                family: 'Jersey 10',
                size: 12,
                color: '#4D243D'
            }
        },
        xaxis: {
            rangeslider: {
                visible: false
            },
            type: 'date'
        },
        yaxis: {
            autorange: true,
            type: 'linear'
        }
    };

    Plotly.newPlot('plot', [traceCandlestick, traceStrategy, traceBuySignals, traceSellSignals], layout, {responsive: true});
}
