import requests
from pattern_detection import detect_hammer, detect_three_white_soldiers
from visualize_chart import visualize_candlestick


def fetch_ohlc_data(symbol, interval='1h', limit=100):
    """
    Fetch OHLC data from Binance API.

    :param symbol: The trading pair symbol (e.g., BTCUSDT)
    :param interval: Timeframe for the candlesticks (default: 1 hour)
    :param limit: Number of candlesticks to fetch (default: 100)
    :return: List of OHLC data
    """
    url = f"https://api.binance.com/api/v3/klines"
    params = {
        "symbol": symbol,
        "interval": interval,
        "limit": limit
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        ohlc_data = []
        for candle in data:
            ohlc_data.append({
                "open_time": candle[0],
                "open": float(candle[1]),
                "high": float(candle[2]),
                "low": float(candle[3]),
                "close": float(candle[4]),
                "volume": float(candle[5])
            })
        return ohlc_data
    else:
        print("Failed to fetch data:", response.json())
        return None


# Fetch data
symbol = "BTCUSDT"  # Example: Bitcoin/USDT trading pair
interval = "1h"     # 1-hour candlesticks
limit = 10          # Fetch the last 10 candlesticks
data = fetch_ohlc_data(symbol, interval, limit)

# Ensure data is available before running detection
if data:
    # Initialize the list to store detected patterns
    detected_patterns = []

    # Detect Hammer pattern
    for i, candle in enumerate(data):
        if detect_hammer(candle):
            print(f"Hammer pattern detected at Candle {i+1}: {candle}")
            detected_patterns.append(("Hammer", i))

    # Detect Three White Soldiers pattern
    for i in range(len(data) - 2):
        if detect_three_white_soldiers(data[i:i+3]):
            print(f"Three White Soldiers pattern detected starting at Candle {i+1}")
            detected_patterns.append(("Three White Soldiers", i))

    # Visualize the data and save the chart
    visualize_candlestick(data, detected_patterns, save_path="candlestick_chart.png")
    print("Candlestick chart saved as 'candlestick_chart.png'.")
else:
    print("No data fetched. Please check your API connection.")



