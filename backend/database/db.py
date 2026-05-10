import pyodbc

def get_connection():
    return pyodbc.connect(
        "DRIVER={SQL Server};"
        "SERVER=.\\SQLEXPRESS;" 
        "DATABASE=EduPlayDB;"
        "Trusted_Connection=yes;"
    )