import mplfinance as mpf
import pandas as pd


def visualize_candlestick(data, detected_patterns, save_path="candlestick_chart.png"):
    """
    Visualize candlestick chart with detected patterns highlighted and save it as an image.

    :param data: List of candlestick data (OHLC).
    :param detected_patterns: List of tuples with (pattern_name, start_index).
    :param save_path: File path to save the chart image.
    """
    # Convert data to a Pandas DataFrame
    df = pd.DataFrame(data)
    df['open_time'] = pd.to_datetime(df['open_time'], unit='ms')  # Convert timestamp to datetime
    df.set_index('open_time', inplace=True)  # Set datetime as index

    # Create alines for detected patterns
    alines = []
    for pattern_name, start_index in detected_patterns:
        if pattern_name == "Three White Soldiers":
            # Append the timestamps for the 3 candles that form the pattern
            pattern_times = df.index[start_index:start_index + 3].tolist()
            alines.append([(pattern_times[0], df['low'][start_index]),  # Start point
                           (pattern_times[2], df['high'][start_index + 2])])  # End point

    # Plot candlestick chart and save it as an image
    mpf.plot(
        df,
        type="candle",
        style="charles",
        title="Candlestick Chart with Detected Patterns",
        volume=True,
        alines=alines,  # Pass the alines list directly
        savefig=save_path  # Save the chart as an image
    )