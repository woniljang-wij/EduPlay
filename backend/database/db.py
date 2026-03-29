import pyodbc

def get_connection():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=localhost\\SQLEXPRESS;" 
        "DATABASE=EduPlayDB;"
        "Trusted_Connection=yes;"
    )