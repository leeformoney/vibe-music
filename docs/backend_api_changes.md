# ASMR 音频管理系统后端改造说明

> 适用环境：Node / Java / Python / PHP 等任意语言实现，只要遵循下列 REST 规范即可。

## 1. 数据库结构

```sql
-- 分类表
CREATE TABLE category (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE COMMENT '分类名称',
  description TEXT DEFAULT NULL COMMENT '描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='音频分类';

-- 音频表
CREATE TABLE audio (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  category_id INT UNSIGNED NULL,
  title VARCHAR(200) NOT NULL COMMENT '音频标题',
  cover_url VARCHAR(255) DEFAULT NULL COMMENT '封面地址',
  audio_url VARCHAR(255) DEFAULT NULL COMMENT '音频文件地址',
  duration INT UNSIGNED DEFAULT NULL COMMENT '时长(秒)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_audio_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL ON UPDATE CASCADE
) COMMENT='音频资源';
```

## 2. 接口一览

> 所有接口统一返回格式：
>
> ```jsonc
> {
>   "code": 0,            // 0 表示成功，其余为失败码
>   "message": "success", // 文字描述
>   "data": { ... }        // 结构见各接口说明
> }
> ```

### 2.1 分类管理

| 方法 | URI | 说明 |
| ---- | --- | ---- |
| GET  | /admin/getAllCategories?pageNum=&pageSize=&name= | 分页查询分类列表 |
| POST | /admin/addCategory | 新增分类 |
| PUT  | /admin/updateCategory | 修改分类 |
| DELETE | /admin/deleteCategory/{id} | 删除单个分类 |
| DELETE | /admin/deleteCategories | 批量删除，Body: `[1,2,3]` |

#### 2.1.1 新增/修改 Category

```json
// Request Body
{
  "id": 1,          // 修改时必填
  "name": "自然雨声",
  "description": "令人放松的雨滴声"
}
```

### 2.2 音频管理

| 方法 | URI | 说明 |
| ---- | --- | ---- |
| GET  | /admin/getAudios?pageNum=&pageSize=&categoryId=&title= | 分页查询音频列表 |
| POST | /admin/addAudio | 新增音频（JSON） |
| PUT  | /admin/updateAudio | 修改音频（JSON） |
| PATCH | /admin/updateAudioCover/{id} | 上传/替换封面 `multipart/form-data` |
| PATCH | /admin/updateAudioFile/{id} | 上传/替换音频 `multipart/form-data` |
| DELETE | /admin/deleteAudio/{id} | 删除单个音频 |
| DELETE | /admin/deleteAudios | 批量删除，Body: `[1,2]` |

#### 2.2.1 新增/修改 Audio

```jsonc
// Request Body
{
  "id": 1,            // 修改时必填
  "title": "雨声 15min",
  "categoryId": 2,
  "duration": 900     // 可选
}
```

#### 2.2.2 上传封面 / 音频

- Content-Type: `multipart/form-data`
- 表单字段：
  - `file`  文件内容

成功示例：
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "url": "https://static.xxx.com/audio/2024/06/01/abcd.jpg"
  }
}
```

前端拿到 `url` 后会自动填充到相应字段。

## 3. 兼容性

- 旧 "歌曲/歌手" 模块可全部废弃。
- 建议返回字段保持 `id / title / categoryId / categoryName / cover_url / audio_url / created_at / duration`，以便前端直接渲染。

## 4. 鉴权/权限

- 继续沿用现有 JWT/Token 方案，需在 `Authorization` 请求头携带 token。

## 5. 其他建议

1. 音频文件可存储到对象存储（S3、OSS、COS）或本地静态目录。
2. 建议开启 Range 请求，支持断点播放。
3. 上传接口应限制文件大小（例如 ≤ 200MB）、白名单格式（mp3、wav、flac）。
4. 建议开启 CDN 加速以及 HTTPS 访问。

---
如有字段或业务逻辑需要调整，请告知！ 