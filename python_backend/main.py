import pandas as pd
from flask import Flask, jsonify, request
from datetime import timedelta
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) 

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"message": "Health Endpoint"})

@app.route('/merge-ds', methods=['GET'])
def merge():
    df1 = pd.read_excel('downstream.xlsx')   
    df2 = pd.read_excel('extruder.xlsx')  
    df1["localizedtimestamp"] = pd.to_datetime(df1["localizedtimestamp"], format="%d-%m-%Y %H:%M:%S", errors="coerce")
    df2["localizedtimestamp"] = pd.to_datetime(df2["localizedtimestamp"], format="%d-%m-%Y %H:%M:%S", errors="coerce")
 
    distance = 16.2  

    df1['ms'] = df1['line_speed_actual'] * 0.01 / 60
    df1['secs'] = distance / df1['ms']
    df1['expected_end_time'] = df1['localizedtimestamp'] + pd.to_timedelta(df1['secs'], unit='s')

   
    merged_rows = []
    for i, row1 in df1.iterrows():
        expected_time = row1['expected_end_time']
        closest_idx = (df2['localizedtimestamp'] - expected_time).abs().idxmin()
        row2 = df2.loc[closest_idx]
        time_diff = abs((row2['localizedtimestamp'] - expected_time).total_seconds())

        merged_rows.append({
            "start_time": row1["localizedtimestamp"],
            "expected_end_time": expected_time,
            "line_speed_actual": row1["line_speed_actual"],
            "linear_weight_actual": row1["linear_weight_actual"],
            "rpm_timestamp": row2["localizedtimestamp"],
            "rpm_speed": row2["rpm_speed"],
            "time_taken_s": round(row1["secs"], 3),
        })

    merged_df = pd.DataFrame(merged_rows)
    output_file = 'merged_output.xlsx'
    merged_df.to_excel(output_file, index=False)
    return jsonify({
        "message": "Merge completed successfully.",
        "rows_merged": len(merged_df),
        "output_file": output_file,
        "sample_preview": merged_df.head(5).to_dict(orient='records')
    })

@app.route('/xl-json',methods=['GET'])
def xlsx_to_json():
    df = pd.read_excel('merged_output.xlsx')
    data_json = df.to_dict(orient='records')
    return jsonify({
     "message": f"Successfully converted to JSON.",
     "rows": len(data_json),
     "data": data_json
    })    



if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=8080,
        debug=True
    )
