## Format lỗi trả về cho người dùng

Chúng ta nên thống nhất format lỗi trả về cho người dùng

Lỗi thường

```ts
{
  message: string
  error_info?: any
}

```

Lỗi validation (422)
{
  message: string
  error:{
  [field: string ] :{
  msg: string
  location: string
  value: any
    }
  }

}

Loi bth throw Eror là trả về 422 liên quan đến Entity