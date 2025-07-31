import pandas as pd
data1 = {                                  
    'ID': [1,2,3,4],
    'Name': ('Alice','Bob','Charlie','David'),
    'Age': [25,30,35,40]
}
data2 = {
    'ID': [3,4,5,6],
    'Salary': [70000,80000,90000,100000],
    'Department': ('HR','Finance','IT','Marketing')
}
df1 = pd.Dataframe(data1) 
df2 = pd.Dataframe(data2)
print("Dataset1:\n",df1)
print("Dataset2:\n",df2)
