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

export default function PasswordReset() {
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
              Password Has Been Reset
            </Heading>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[14px] leading-[24px] text-black">
              The password for you&apos;re <strong>{env.APP_NAME}</strong>{" "}
              account has been changed.
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              Best,
              <br />
              <strong>{env.APP_NAME}</strong>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              If you are not expecting this email, please{" "}
              <Link href="http://google.com">get in touch with us</Link>.
            </Text>
          </Container>
        </body>
      </Tailwind>
    </Html>
  );
}
