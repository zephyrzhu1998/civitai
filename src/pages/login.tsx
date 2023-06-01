import { Container, Paper, Stack, Text, Alert, Group, ThemeIcon, Divider } from '@mantine/core';
import { IconExclamationMark } from '@tabler/icons';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { BuiltInProviderType } from 'next-auth/providers';
import { getCsrfToken, getProviders, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { EmailLogin } from '~/components/EmailLogin/EmailLogin';
import { MobilephoneLogin } from '~/components/MobilephoneLogin/MobilephoneLogin';
import { SignInError } from '~/components/SignInError/SignInError';
import { SocialButton } from '~/components/Social/SocialButton';

import { getServerAuthSession } from '~/server/utils/get-server-auth-session';
import { createServerSideProps } from '~/server/utils/server-side-helpers';
import { loginRedirectReasons, LoginRedirectReason } from '~/utils/login-helpers';

export default function Login({ providers }: Props) {
  const router = useRouter();
  const {
    error,
    returnUrl = '/',
    reason,
  } = router.query as { error: string; returnUrl: string; reason: LoginRedirectReason };

  const redirectReason = loginRedirectReasons[reason];

  return (
    <Container size="xs">
      <Stack>
        {!!redirectReason && (
          <Alert color="yellow">
            <Group position="center" spacing="xs" noWrap align="flex-start">
              <ThemeIcon color="yellow">
                <IconExclamationMark />
              </ThemeIcon>
              <Text size="md">{redirectReason}</Text>
            </Group>
          </Alert>
        )}
        <Paper radius="md" p="xl" withBorder>
          <Text size="lg" weight={500}>
            Welcome to Civitai, sign in with
          </Text>

          <Stack mb={error ? 'md' : undefined} mt="md">
            {providers
              ? Object.values(providers)
                  .filter((x) => x.id !== 'email')
                  .map((provider) => {
                    return (
                      <SocialButton
                        key={provider.name}
                        provider={provider.id as BuiltInProviderType}
                        onClick={() => signIn(provider.id, { callbackUrl: returnUrl })}
                      />
                    );
                  })
              : null}
            <MobilephoneLogin />
            <Divider label="Or" labelPosition="center" />
            <EmailLogin />
          </Stack>
          {error && (
            <SignInError
              color="yellow"
              title="Login Error"
              mt="lg"
              variant="outline"
              error={error}
            />
          )}
        </Paper>
      </Stack>
    </Container>
  );
}

type NextAuthProviders = AsyncReturnType<typeof getProviders>;
type NextAuthCsrfToken = AsyncReturnType<typeof getCsrfToken>;
type Props = {
  providers: NextAuthProviders;
  csrfToken: NextAuthCsrfToken;
};

export const getServerSideProps = createServerSideProps({
  useSession: true,
  resolver: async ({ session }) => {
    if (session) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    const providers = await getProviders();
    const csrfToken = await getCsrfToken();

    return {
      props: { providers, csrfToken },
    };
  },
});
