import {
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import env from "~/config/environment.config.server";

interface IProps {
  resetUrl: string;
  contactEmail: string;
}

export default function ForgotPassword(props: IProps) {
  const { resetUrl, contactEmail } = props;

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Preview Text</Preview>
      <Tailwind>
        <body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Img
              src="https://picsum.photos/400/200"
              alt={env.APP_NAME}
              width="200px"
              height="auto"
              className="float-none mx-auto my-0 mb-2 block"
            />
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Reset Your Password
            </Heading>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[14px] leading-[24px] text-black">
              Someone has requested a password reset for your{" "}
              <strong>{env.APP_NAME}</strong> account.
            </Text>
            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={resetUrl}
              >
                Click here to reset your passowrd
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              If the button above does not work for you, copy and paste the
              following into your browsers address bar
              <br />
              <Link href={resetUrl}>{resetUrl}</Link>
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              If you didn&apos;t ask to reset your password, you can disregard
              this email.
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              Regards,
              <br />
              <strong>{env.APP_NAME}</strong>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              If you are concerned about your account&apos;s safety, please feel
              free to{" "}
              <Link href={`mailto:${contactEmail}`}>get in touch with us</Link>.
            </Text>
          </Container>
        </body>
      </Tailwind>
    </Html>
  );
}
