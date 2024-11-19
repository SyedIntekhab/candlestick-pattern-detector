def detect_hammer(candle):
    """
    Detect if a single candlestick is a hammer pattern.
    :param candle: Dictionary containing OHLC data for one candle.
    :return: True if it matches the hammer pattern, False otherwise.
    """
    body = abs(candle["open"] - candle["close"])
    lower_shadow = candle["low"] - min(candle["open"], candle["close"])
    upper_shadow = candle["high"] - max(candle["open"], candle["close"])

    # Hammer condition: long lower shadow, small body, small upper shadow
    if lower_shadow > 2 * body and upper_shadow < 0.5 * body:
        return True
    return False


def detect_three_white_soldiers(candles):
    """
    Detect if three consecutive candlesticks form the Three White Soldiers pattern.
    :param candles: List of three candlesticks (OHLC data).
    :return: True if the pattern is detected, False otherwise.
    """
    if len(candles) < 3:
        return False

    for i in range(1, 3):
        # Each candle must close higher than it opens and higher than the previous close
        if candles[i]["close"] <= candles[i]["open"] or candles[i]["close"] <= candles[i - 1]["close"]:
            return False
    return True