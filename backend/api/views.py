import os
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def search(request):
    ts = str(request.GET.get('search', None)).upper()
    file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tools/NSE")
    try:
        with open(file_path, 'r') as f:
            file_content = [line[:-1] for line in f.readlines() if line.__contains__(ts)]
        return Response({"stocks": file_content}, status=status.HTTP_200_OK)
    except FileNotFoundError:
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_NIFTY_50(request):
    file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tools/NIFTY50")
    try:
        with open(file_path, 'r') as f:
            file_content = [line[:-1] for line in f.readlines()]
        return Response({"stocks": file_content}, status=status.HTTP_200_OK)
    except FileNotFoundError:
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)