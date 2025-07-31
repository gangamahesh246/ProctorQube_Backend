
def add(a, b):
    return a + b
def subtract(a, b):
    return a - b
def multiply(a, b):
    return a * b
def divide(a, b):
    return a / b
def calculate():
    print("Welcome to Buggy Calculator")
    try:
        a = input("Enter first number: ")
        b = input("Enter second number: ")
    except ValueError:
        print("Please enter valid numbers.")
        return
    print("Select operation:")
    print("1. Addition")
    print("2. Subtraction")
    print("3. Multiplication")
    print("4. Division")
