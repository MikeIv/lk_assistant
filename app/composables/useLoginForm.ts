import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import { loginFormSchema, type LoginFormValues } from '#shared/utils/loginSchema'

const EMPTY_FORM_VALUES: LoginFormValues = {
  email: '',
  password: '',
  remember: false,
}

export function useLoginForm(initialValues: LoginFormValues = EMPTY_FORM_VALUES) {
  const form = useForm({
    validationSchema: toTypedSchema(loginFormSchema),
    initialValues: { ...initialValues },
  })

  const [email, emailAttrs] = form.defineField('email')
  const [password, passwordAttrs] = form.defineField('password')
  const [remember, rememberAttrs] = form.defineField('remember')

  return {
    ...form,
    email,
    emailAttrs,
    password,
    passwordAttrs,
    remember,
    rememberAttrs,
  }
}
