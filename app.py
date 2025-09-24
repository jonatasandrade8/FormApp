import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template
import pymysql.cursors

# Carrega as variáveis do arquivo .env
load_dotenv()

app = Flask(__name__)

# Configurações do banco de dados
db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_DATABASE'),
    'port': int(os.getenv('DB_PORT', 3306))
}

print(f"DEBUG: DB_HOST={db_config['host']}, DB_USER={db_config['user']}, DB_DATABASE={db_config['database']}, DB_PORT={db_config['port']}")

@app.route('/')
def index():
    print("DEBUG: Acessando rota /")
    try:
        return render_template('index.html')
    except Exception as e:
        print(f"ERROR: Erro ao renderizar index.html: {e}")
        return "Erro ao carregar a página.", 500

@app.route('/enviar_estoque', methods=['POST'])
def enviar_estoque():
    print("DEBUG: Recebendo requisição POST para /enviar_estoque")
    try:
        data = request.json
        print(f"DEBUG: Dados recebidos: {data}")
        
        # Obter os dados hierárquicos para a consulta
        estado_selecionado = data.get('estado')
        rede_selecionada = data.get('rede')
        loja_selecionada = data.get('loja')
        
        if not (estado_selecionado and rede_selecionada and loja_selecionada):
            return jsonify({'error': 'Dados incompletos'}), 400
        
        print("DEBUG: Tentando conectar ao MySQL com PyMySQL...")
        conexao = pymysql.connect(**db_config, autocommit=False)
        print("DEBUG: Conexão MySQL estabelecida com sucesso usando PyMySQL.")
        
        cursor = conexao.cursor()

        # Passo 1: Encontrar o loja_id a partir dos nomes de estado, rede e loja
        sql_loja_id = """
        SELECT
            l.id
        FROM lojas l
        JOIN redes r ON l.rede_id = r.id
        JOIN estados e ON r.estado_id = e.id
        WHERE e.sigla = %s AND r.nome = %s AND l.nome = %s
        """
        
        cursor.execute(sql_loja_id, (estado_selecionado, rede_selecionada, loja_selecionada))
        resultado = cursor.fetchone()
        
        if not resultado:
            return jsonify({'error': 'Loja não encontrada no banco de dados'}), 404

        loja_id = resultado[0]
        
        # Passo 2: Preparar a query para inserir os dados de estoque
        sql_insert = "INSERT INTO estoque (loja_id, produto, tipo_caixa, quantidade) VALUES (%s, %s, %s, %s)"
        
        # Itera sobre cada item na lista 'estoque' para inseri-lo como uma nova linha
        for item in data.get('estoque', []):
            valores = (
                loja_id,
                item.get('produto'),
                item.get('caixa'),
                item.get('quantidade')
            )
            print(f"DEBUG: Executando SQL para item: {valores}")
            cursor.execute(sql_insert, valores)
        
        conexao.commit()
        
        # Fecha a conexão
        cursor.close()
        conexao.close()
        print("DEBUG: Dados inseridos e conexão MySQL fechada.")
        
        return jsonify({'message': 'Dados recebidos e salvos com sucesso!'}), 200

    except pymysql.Error as err:
        conexao.rollback()
        print(f"ERROR: Erro no MySQL com PyMySQL: {err}")
        return jsonify({'error': f"Erro no banco de dados: {err}"}), 500
    except Exception as e:
        print(f"ERROR: Erro geral: {e}")
        return jsonify({'error': f"Erro interno do servidor: {e}"}), 500

if __name__ == '__main__':
    print("DEBUG: Tentando iniciar o servidor Flask...")
    app.run(debug=True)