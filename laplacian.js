        /**
        * 画像ファイルの読み込んで画像をcanvasに描画
        * getImageData()で画像のピクセルを取得
        * ピクセル情報の配列を取得
        **/
        const input = document.getElementById('inputImage');

        //input要素にchangeイベントが発生した際のコールバック関数
        input.addEventListener('change', () => {
          /**
           * FiliReaderオブジェクトでファイルの読み込み
           * Imageオブジェクトで読み込まれた画像を表示するcanvasの作成
           **/
  
          const file = input.files[0];
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0); // 読み込んだ画像をcanvasに描画
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // キャンバスのピクセル情報をImageDataオブジェクトとして取得
              const data = imageData.data; // 各ピクセルを格納するための配列(RGBA)
  
              /**
               * 以下がラプラシアンフィルタによる領域抽出
               * 取得した画像の各ピクセルに対してエッジ検出を実施
               * ループで各ピクセルのRGB値を取得する
               * 取得した値に対してエッジを検出して新たに値を割り当てる
               * RGB値を元に領域を判定して，閾値を超えている場合は赤に，それ以外は黒に（何色がいいかは要検討）
               **/
  
              for (let i = 0; i < data.length; i += 4) {
                const x = (i / 4) % canvas.width;
                const y = Math.floor(i / 4 / canvas.width);
                let sum = 0;
                if (x > 0 && y > 0) {
                  sum += -1 * data[(i - canvas.width * 4) + 1] - 1 * data[i - canvas.width * 4] - 1 * data[(i - canvas.width * 4) - 1];
                }
                if (x > 0) {
                  sum += -1 * data[i - 4] + 8 * data[i] - 1 * data[i + 4];
                }
                if (x > 0 && y < canvas.height - 1) {
                  sum += -1 * data[(i + canvas.width * 4) - 1] - 1 * data[i + canvas.width * 4] - 1 * data[(i + canvas.width * 4) + 1];
                }
                sum = Math.max(sum, 0);
                sum = Math.min(sum, 255);
                if (sum > 230) {  // 領域の閾値を設定(200〜250くらい？)
                  data[i] = sum; //赤くする場合は=sum，白の場合は255
                  data[i + 1] = 0; //赤くする場合は=sum，白の場合は255
                  data[i + 2] = 0; //赤くする場合は=sum，白の場合は255
                } else {
                  data[i] = 0;
                  data[i + 1] = 0;
                  data[i + 2] = 0;
                }
              }
  
              /**
               * Imageオブジェクトを読み込んでcanvasに描画
               * Imageオブジェクトに対してフィルター処理を適用する
               **/
              ctx.putImageData(imageData, 0, 0);
              const output = document.getElementById('outputImage');
              output.src = canvas.toDataURL();
            };
            img.src = reader.result;
          };
          reader.readAsDataURL(file);
        });