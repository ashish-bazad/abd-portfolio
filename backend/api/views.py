import pandas as pd
import numpy as np
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .tools import first_page
from .tools.equities import *
from .tools.commodities import *
from .tools.REIT import *
from .tools.t_notes import *
from .tools.crypto import *
from .tools.nifty50 import *

@api_view(['GET'])
def search_equity(request):
    to_search = str(request.GET.get('search', "")).upper()
    result = {}
    for key, value in equity_tickers.items():
        if key.startswith(to_search) or (value.lower()).__contains__(to_search.lower()):
            result[key] = value
    return Response({"tickers": result}, status=status.HTTP_200_OK)

@api_view(['GET'])
def search_REIT(request):
    to_search = str(request.GET.get('search', "")).upper()
    result = {}
    for key, value in reit_tickers.items():
        if key.startswith(to_search) or (value.lower()).__contains__(to_search.lower()):
            result[key] = value
    return Response({"tickers": result}, status=status.HTTP_200_OK)

@api_view(['GET'])
def search_t_notes(request):
    to_search = str(request.GET.get('search', "")).upper()
    result = {}
    for key, value in t_notes_tickers.items():
        if key.startswith(to_search) or (value.lower()).__contains__(to_search.lower()):
            result[key] = value
    return Response({"tickers": result}, status=status.HTTP_200_OK)

@api_view(['GET'])
def search_crypto(request):
    to_search = str(request.GET.get('search', "")).upper()
    result = {}
    for key, value in crypto_tickers.items():
        if key.startswith(to_search) or (value.lower()).__contains__(to_search.lower()):
            result[key] = value
    return Response({"tickers": result}, status=status.HTTP_200_OK)

@api_view(['GET'])
def search_commodities(request):
    to_search = str(request.GET.get('search', "")).upper()
    result = {}
    for key, value in commodities_tickers.items():
        if key.startswith(to_search) or (value.lower()).__contains__(to_search.lower()):
            result[key] = value
    return Response({"tickers": result}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_equity_tickers(request):
    return Response({"tickers": nifty50_tickers}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_commodities_tickers(request):
    return Response({"tickers": commodities_tickers}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_REIT_tickers(request):
    return Response({"tickers": reit_tickers}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_t_notes_tickers(request):
    return Response({"tickers": t_notes_tickers}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_crypto_tickers(request):
    return Response({"tickers": crypto_tickers}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_tickers_data(request):
    tickers_list = request.GET.get('tickers', None).split(',')
    print(tickers_list)
    period = str(request.GET.get('period', '1y'))
    table_data, price_data, volatility_data = {}, {}, {}
    try:
        table_data, price_data, volatility_data = first_page.initialize(tickers_list,  period=period)
        # print(table_data)
        # print(price_data)
        # print(volatility_data)
    except Exception as e:
        print(e)
    # dft, dfp, dfv = pd.DataFrame(table_data), pd.DataFrame(price_data), pd.DataFrame(volatility_data)
    # dft.fillna(0, inplace=True)
    # dfp.fillna(0, inplace=True)
    # dfv.fillna(0, inplace=True)
    # dft.replace([np.inf, -np.inf], np.nan, inplace=True)
    # dfp.replace([np.inf, -np.inf], np.nan, inplace=True)
    # dfv.replace([np.inf, -np.inf], np.nan, inplace=True)
    # table_data, price_data, volatility_data = dft.to_dict(orient='records'), dfp.to_dict(orient='records'), dfv.to_dict(orient='records')
    return Response({"table_data": table_data, "price_data": price_data, "volatility_data": volatility_data}, status=status.HTTP_200_OK)