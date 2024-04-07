import {
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";

import env from "~/config/environment.config.server";

interface IProps {
  contactEmail: string;
}

export default function AccountLocked(props: IProps) {
  const { contactEmail } = props;

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
              Account Locked
            </Heading>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[14px] leading-[24px] text-black">
              We have locked your <strong>{env.APP_NAME}</strong> account
              account after a number of failed attempts were made to sign in. We
              limit the number of times that someone can try signing in to an
              account for security reasons and your protection.
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              When your account is locked, you will be required to reset your
              password in order to gain access again.
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              Regards,
              <br />
              <strong>{env.APP_NAME}</strong>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              If you believe an unauthorized person has been attempting to
              access your account and are concerned about your account&apos;s
              safety, please feel free to{" "}
              <Link href={`mailto:${contactEmail}`}>get in touch with us</Link>.
            </Text>
          </Container>
        </body>
      </Tailwind>
    </Html>
  );
}
