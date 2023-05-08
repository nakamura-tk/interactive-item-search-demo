import json
import requests
import yaml
from pathlib import Path

def main():
    # FastAPIサーバーのURL
    api_url = "http://127.0.0.1:8000/openapi.json"
    
    # 出力先ディレクトリ
    output_dir = Path("../../docs/")
    output_dir.mkdir(parents=True, exist_ok=True)

    # 出力ファイルのパス
    output_file = output_dir / "openapi.yaml"

    # OpenAPI JSONドキュメントを取得
    response = requests.get(api_url)
    openapi_json = response.json()

    # JSONをYAMLに変換
    openapi_yaml = yaml.dump(openapi_json)

    # YAMLファイルに出力
    with output_file.open("w") as f:
        f.write(openapi_yaml)

if __name__ == "__main__":
    main()
