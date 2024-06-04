import os
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .tools import first_page

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "tools/NSE"), 'r') as f:
    stocks = [line[:-1] for line in f.readlines()]
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "tools/NIFTY50"), 'r') as f:
    nifty50 = [line[:-1] for line in f.readlines()]

@api_view(['GET'])
def search(request):
    result = [stock for stock in stocks if stock.startswith(str(request.GET.get('search', None)).upper())]
    return Response({"stocks": result}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_NIFTY_50(request):
    return Response({"stocks": nifty50}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_stock_data(request):
    stock_list = [stock+".NS" for stock in request.GET.get('stocks', None).split(',')]
    period = str(request.GET.get('period', '1y'))
    table, price_data, volatility_data = first_page.initialize(stock_list,  period=period)
    return Response({"table": table, "price_data": price_data, "volatility_data": volatility_data}, status=status.HTTP_200_OK)