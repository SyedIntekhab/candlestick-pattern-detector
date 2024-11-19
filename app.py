import streamlit as st
import pandas as pd
import requests
import mplfinance as mpf
from io import BytesIO
from pattern_detection import detect_hammer, detect_three_white_soldiers
import time


def fetch_ohlc_data(symbol, interval='1h', limit=100):
    url = f"https://api.binance.com/api/v3/klines"
    params = {"symbol": symbol, "interval": interval, "limit": limit}
    response = requests.get(url, params=params)
    data = response.json()
    ohlc_data = [
        {"open_time": x[0], "open": float(x[1]), "high": float(x[2]), 
         "low": float(x[3]), "close": float(x[4]), "volume": float(x[5])}
        for x in data
    ]
    return pd.DataFrame(ohlc_data)


st.title("Real-Time Candlestick Pattern Detector")
st.sidebar.header("Settings")

# Dropdown for coin selection
symbol = st.sidebar.selectbox("Select Coin", ["BTCUSDT", "ETHUSDT", "BNBUSDT"])
interval = st.sidebar.selectbox("Timeframe", ["1m", "5m", "15m", "1h", "1d"])
limit = st.sidebar.slider("Number of Candlesticks", 50, 500, 100)

# Real-time update interval
refresh_interval = st.sidebar.slider("Refresh Interval (seconds)", 5, 60, 15)

while True:
    # Fetch and display candlestick data
    data = fetch_ohlc_data(symbol, interval, limit)

    # Detect patterns
    detected_patterns = []
    for i, candle in data.iterrows():
        if detect_hammer(candle):
            detected_patterns.append(("Hammer", i))
        if i >= 2 and detect_three_white_soldiers(data.iloc[i - 2:i + 1].to_dict("records")):
            detected_patterns.append(("Three White Soldiers", i - 2))

    # Display detected patterns
    st.subheader("Detected Patterns")
    if detected_patterns:
        for pattern, start_index in detected_patterns:
            st.write(f"{pattern} starting at {data.iloc[start_index]['open_time']}")
    else:
        st.write("No patterns detected.")

    # Generate and show chart
    st.subheader(f"{symbol} Candlestick Chart ({interval})")
    buffer = BytesIO()
    mpf.plot(
        data.set_index(pd.to_datetime(data["open_time"], unit="ms")),
        type="candle",
        style="charles",
        savefig=dict(fname=buffer, dpi=100, bbox_inches="tight")
    )
    st.image(buffer)

    # Wait for the refresh interval before rerunning
    time.sleep(refresh_interval)
    st.experimental_rerun()