import type { Wx, WxReq1, WxReq2 } from '../../types/libs';
import { UploadTaskImpl } from './UploadTaskImpl';
import { BaseMPO } from './mock-base';
import { readAsDataURL } from './readAsDataURL';

class WxConstructor extends BaseMPO implements Wx {
  request(req: WxReq1) {
    setTimeout(async () => {
      const { header, ...rest } = req;

      const { code, msg } = Object(header);
      if (req.fail && (code || msg)) {
        await Promise.resolve();
        return req.fail({ errno: Number(code), errMsg: msg });
      }

      await Promise.resolve();

      req.success({
        statusCode: Number(Object(header)['status-code']) || 200,
        header: { server: 'mock' },
        data: this.makeData({ ...rest, headers: header }, rest.dataType || rest.responseType),
      });
    });
    return new AbortController();
  }
  uploadFile(req: WxReq2) {
    const { header, name, filePath, formData, ...rest } = req;
    setTimeout(async () => {
      req.success({
        statusCode: Number(Object(header)['status-code']) || 200,
        header: { server: 'mock' },
        data: {
          ...rest,
          data: formData,
          headers: header,
          files: { [name]: await readAsDataURL(filePath) },
        },
      });
    });
    return new UploadTaskImpl();
  }
}

Object.defineProperty(global, 'wx', { value: new WxConstructor() });
